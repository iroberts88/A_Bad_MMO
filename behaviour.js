var utils = require('./utils.js').Utils;
var Utils = new utils();
var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1
var Behaviour = require('./behaviour.js').Behaviour,
    Enums = require('./enums.js').Enums;

var V = SAT.Vector;
var P = SAT.Polygon;
var C = SAT.Circle;
var TILE_SIZE = 48;
//Assign to enemies for Enemy AI

var Behaviour = function() {
    this.V = SAT.Vector;
    this.P = SAT.Polygon;
    this.C = SAT.Circle;
    this.TILE_SIZE = 48;
    this.behaviourEnums = {
        TestBehaviour: 'TestBehaviour',

        BasicAttack: 'basicAttack',

        SearchInRadius: 'searchInRadius',

        Wander: 'wander',
    }
};


//--------------------------------------------------------
//Basic Actions for use in behaviours
//--------------------------------------------------------

Behaviour.prototype.testBehaviour = function(unit,dt,data){
    return null;
}
Behaviour.prototype.testBehaviourInit = function(unit,data){
    return data;
}

Behaviour.prototype.basicAttack = function(unit,dt,data){
    var Behaviour = require('./behaviour.js').Behaviour;
    //move into melee attack range
    //check if path to target is blocked!!!
    if (Math.abs(unit.currentTarget.currentSector.x-unit.currentSector.x) > 1 || Math.abs(unit.currentTarget.currentSector.y-unit.currentSector.y) > 1){
        console.log("clearing target");
        unit.clearTarget();
    }
    if (unit.currentZone.checkPathBlocked(unit.hb.pos,unit.currentTarget.hb.pos)){
        //path is blocked, use A* move
        if (unit.stickToTarget){
            unit.setStick(false); //unstick
        }
        if (data.targetLastTile != unit.currentZone.getTile(unit.currentTarget.hb.pos.x,unit.currentTarget.hb.pos.y) || !data.currentPath.length){
            //target has moved or path hasn't been initialized
            data.currentPath = Behaviour.astar(unit.currentZone.map,unit.currentZone.getTile(unit.hb.pos.x,unit.hb.pos.y),unit.currentZone.getTile(unit.currentTarget.hb.pos.x,unit.currentTarget.hb.pos.y));
            if (!data.currentPath.length){
                return null;
                //there is no path to the target!!!
            }
            data.targetLastTile = unit.currentZone.getTile(unit.currentTarget.hb.pos.x,unit.currentTarget.hb.pos.y)
            data.currentPath.shift();

        }
        this.aStarMoveToNode(unit,dt,data);
        return;
    }else{
        if (!unit.stickToTarget){
            unit.setStick(true); //stick on target
        }
    }

    var distance = Math.sqrt(Math.pow(unit.hb.pos.x-unit.currentTarget.meleeHitbox.pos.x,2)+Math.pow(unit.hb.pos.y-unit.currentTarget.meleeHitbox.pos.y,2));
    if (distance > (unit.meleeHitbox.r+unit.currentTarget.meleeHitbox.r)){
        unit.setMoveVector(unit.currentTarget.hb.pos.x-unit.hb.pos.x,unit.currentTarget.hb.pos.y-unit.hb.pos.y,false);
    }else{
        if (unit.moveVector.x || unit.moveVector.y){
            unit.setMoveVector(0,0,false);
        }
        if (unit.attackDelay <= 0){
            //make the attack
            //check equipped weapons?
            unit.attackDelay = unit.makeWeaponAttack(unit.defaultWeapon,unit.currentTarget);
        }
    }
    return null;
}
Behaviour.prototype.basicAttackInit = function(unit,data){
    if (typeof data['speedMod'] == 'undefined'){
        data.speedMod = 1;
    }else{
        data.speedMod = data['speedMod']
    }
    return data;
}

Behaviour.prototype.wander = function(unit,dt,data){
    var Behaviour = require('./behaviour.js').Behaviour;
    if (!data.currentPath.length){
        data.currentPath = this.astar(unit.currentZone.map,unit.currentZone.getTile(unit.hb.pos.x,unit.hb.pos.y),data.openNodes[Math.floor(Math.random()*data.openNodes.length)]);
        if (!data.currentPath.length){
            return null;
        }
        data.currentPath.shift();
    }
    if (data.waiting){
        data.waitTicker -= dt;
        if (data.waitTicker <= 0){
            data.waiting = false;
        }
    }else{
        this.aStarMoveToNode(unit,dt,data);
        if (!data.currentPath.length){
            data.nextPosition = null;
            data.waiting = true;
            data.waitTicker = Math.ceil(Math.random()*3) + 3;
            unit.setMoveVector(0,0);
        }
    }

    return null;
}
Behaviour.prototype.wanderInit = function(unit,data){
    if (typeof data.currentPath == 'undefined'){
        data.currentPath = [];
    }
    if (typeof data['speedMod'] == 'undefined'){
        data.speedMod = 0.5;
    }else{
        data.speedMod = data['speedMod']
    }
    if (typeof data.openNodes == 'undefined'){
        data.openNodes = [];
        var start = unit.spawn ? unit.spawn.tile : unit.currentZone.getTile(unit.hb.pos.x,unit.hb.pos.y);
        var r = typeof data['radius'] == 'undefined' ? 5 : data['radius'];
        for (var i = -r; i <= r;i++){
            for (var j = -r; j <= r;j++){
                if (unit.currentZone.map[start.x+i][start.y+j].open){
                    data.openNodes.push(unit.currentZone.map[start.x+i][start.y+j]);
                }
            }
        }
        data.waitTicker = 0;
        data.waiting = false;
        data.nextPosition = null;
    }
    return data;
}

Behaviour.prototype.searchInRadius = function(unit,dt,data){
    for (var i in unit.nearbyUnits){
        if (Math.sqrt(Math.pow(unit.hb.pos.x-unit.nearbyUnits[i].hb.pos.x,2) + Math.pow(unit.hb.pos.y-unit.nearbyUnits[i].hb.pos.y,2)) <= unit.baseAggroRadius.value && unit != unit.nearbyUnits[i]){
            if (!unit.nearbyUnits[i].isEnemy){
                unit.setTarget(unit.nearbyUnits[i]);
                unit.setMoveVector(0,0);
                return null;
            }
        }
    }
    return null;
}
Behaviour.prototype.searchInRadiusInit = function(unit,data){
    return data;
}

//UTILITY FUCTIONS

Behaviour.prototype.aStarMoveToNode = function(unit,dt,data){
    var cTile = unit.currentZone.getTile(unit.hb.pos.x,unit.hb.pos.y);
    if (data.nextPosition){
        //check to see if at new position!
        if (cTile == data.currentPath[0]){
            data.currentPath.shift();
            if (!data.currentPath.length){
                return null;
            }
            data.nextPosition = [data.currentPath[0].center.x,data.currentPath[0].center.y];
            unit.setMoveVector(data.nextPosition[0]-unit.hb.pos.x,data.nextPosition[1]-unit.hb.pos.y,true,data.speedMod);
            data.oldPosition = cTile;
            return;
        }
    }else if (data.currentPath.length){
        //get the new position!
        data.nextPosition = [data.currentPath[0].center.x,data.currentPath[0].center.y];
        unit.setMoveVector(data.nextPosition[0]-unit.hb.pos.x,data.nextPosition[1]-unit.hb.pos.y,true,data.speedMod);
        data.oldPosition = cTile;
        return;
    }else{
        data.currentPath = [];
        data.nextPosition = null;
        return null;
    }

    if (data.currentPath[0] != cTile && cTile != data.oldPosition && data.currentPath.length){
        //make sure not diagonal!!
        if (!(Math.abs(data.currentPath[0].x-cTile.x+data.oldPosition.x-cTile.x) == 1 && Math.abs(data.currentPath[0].y-cTile.y+data.oldPosition.y-cTile.y) == 1)){

            data.currentPath = [];
            data.nextPosition = null;
        }
    }
    return null;
}

Behaviour.prototype.astar = function(map,start,end){

    //A* search
    //map = map object
    //start = starting coordinates [x,y];
    //end = ending coordinates [x,y];
    //returns empty array if no path exists
    //returns path array if path exists [node,node,node,...]=

    var openList   = [];
    var closedList = [];
    openList.push(map[start.x][start.y]);

    while(openList.length > 0) {
        // Grab the lowest f(x) to process next
        var lowInd = 0;
        for(var i=0; i<openList.length; i++) {
            if(openList[i].f < openList[lowInd].f) { lowInd = i; }
        }
        var currentNode = openList[lowInd];

        if(currentNode.x == end.x && currentNode.y == end.y) {
            var curr = currentNode;
            var ret = [];
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            var arr = ret.reverse();
            arr.unshift(map[start.x][start.y]);
            //return all scores to 0
            for (var i = 0; i < openList.length;i++){
                openList[i].searchInit();
            }
            for (var i = 0; i < closedList.length;i++){
                closedList[i].searchInit();
            }
            return this.trimExcessNodes(map,arr);
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors
        this.removeGraphNode(openList,currentNode);
        closedList.push(currentNode);

        //get neighbors
        var neighbors = [];
        var x = currentNode.x;
        var y = currentNode.y;
        try{
            if(map[x-1] && map[x-1][y]) {
                neighbors.push(map[x-1][y]);
            }
            if(map[x+1] && map[x+1][y]) {
                neighbors.push(map[x+1][y]);
            }
            if(map[x][y-1] && map[x][y-1]) {
                neighbors.push(map[x][y-1]);
            }
            if(map[x][y+1] && map[x][y+1]) {
                neighbors.push(map[x][y+1]);
            }
            /*// Southwest
            if(map[x-1] && map[x-1][y-1]) {
                neighbors.push(map[x-1][y-1]);
            }
            // Southeast
            if(map[x+1] && map[x+1][y-1]) {
                neighbors.push(map[x+1][y-1]);
            }
            // Northwest
            if(map[x-1] && map[x-1][y+1]) {
                neighbors.push(map[x-1][y+1]);
            }
            // Northeast
            if(map[x+1] && map[x+1][y+1]) {
                neighbors.push(map[x+1][y+1]);
            }*/
        }catch(e){
            console.log(x + "," + y);
            console.log(e);
        }

        for(var i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];
            if(this.findGraphNode(closedList,neighbor) || !neighbor.open) {
                // not a valid node to process, skip to next neighbor
                continue;
            }

            // g score is the shortest distance from start to current node, check if the path we have arrived
            //at this neighbor is the shortest one we have seen yet
            var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
            var gScoreIsBest = false;

            if(!this.findGraphNode(openList,neighbor)) {
                // This the the first time we have arrived at this node, it must be the best

                gScoreIsBest = true;

                //take heuristic score
                var d1 = Math.abs(map[end.x][end.y].x - neighbor.x);
                var d2 = Math.abs(map[end.x][end.y].y - neighbor.y);
                neighbor.h = d1+d2;
                openList.push(neighbor);
            }
            else if(gScore < neighbor.g) {
                // We have already seen the node, but last time it had a worse g (distance from start)
                gScoreIsBest = true;
            }

            if(gScoreIsBest) {
                // Found an optimal (so far) path to this node.  Store info on how we got here and how good it is
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
                // neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
            }
        }
    }

    for (var i = 0; i < openList.length;i++){
        openList[i].searchInit();
    }
    for (var i = 0; i < closedList.length;i++){
        closedList[i].searchInit();
    }
    // No result was found -- empty array signifies failure to find path
    return [];
}

Behaviour.prototype.trimExcessNodes = function(map,arr){
    //check path blocked between1 locations
    if (arr.length <=2){return arr;}
    var startNode = arr[0];
    for (var i = 1; i < arr.length;i++){
    }
    return arr;
};
Behaviour.prototype.checkPathBlocked = function(map,u1,u2){
    //check path blocked between1 locations
    var mVec = new V(u2.x-u1.x,u2.y-u1.y);
    if (this.getTile(u1.x,u1.y) == this.getTile(u2.x,u2.y)){
        return false;
    }
    var hyp = Math.sqrt((mVec.x*mVec.x) + (mVec.y*mVec.y));
    mVec.normalize();
    var tile;
    for (var i = 1; i <= Math.abs((mVec.x*mVec.y)/this.TILE_SIZE);i++){
        tile = this.getTile(map,u1.x+this.TILE_SIZE*mVec.x*i,u1.y+this.TILE_SIZE*mVec.y*i);
        if (!tile){return true;}
        if (!tile.open){
            return true;
        }
    }
    return false;
};
Behaviour.prototype.getTile = function(map,x,y){
    //console.log('Getting Tile:   ' +  x + ', ' + y);
    //get sector by position
    if (typeof map[Math.floor(x/this.TILE_SIZE)][Math.floor(y/this.TILE_SIZE)] != 'undefined'){
        return map[Math.floor(x/this.TILE_SIZE)][Math.floor(y/this.TILE_SIZE)];
    }else{
        return null;
    }
}

Behaviour.prototype.findGraphNode = function(arr,node){
    //for use in astar
    //searches array 'arr' for node 'node'
    //returns true if array contains node
    //returns false if array doesnt contain node
    for (var i = 0;i < arr.length;i++){
        if (arr[i] == node){
            return true;
        }
    }
    return false;
}

Behaviour.prototype.removeGraphNode = function(arr,node){
    //for use in astar
    //removes node 'node' from array 'arr'
    for (var i = 0;i < arr.length;i++){
        if (arr[i] == node){
            arr.splice(i,1);
        }
    }
}

Behaviour.prototype.executeBehaviour = function(actionStr,unit,dt,data){
    //return a behaviour based on passed id
    switch(actionStr) {
        case this.behaviourEnums.TestBehaviour:
            return this.testBehaviour(unit,dt,data);
            break;
        case this.behaviourEnums.BasicAttack:
            return this.basicAttack(unit,dt,data);
            break;
        case this.behaviourEnums.Wander:
            return this.wander(unit,dt,data);
            break;
        case this.behaviourEnums.SearchInRadius:
            return this.searchInRadius(unit,dt,data);
            break;
        default:
            return this.testBehaviour(unit,dt,data);
            break;
    }
}

Behaviour.prototype.initBehaviour = function(actionStr,unit,data){
    //initialize a behaviour data object
    switch(actionStr) {
        case this.behaviourEnums.TestBehaviour:
            return this.testBehaviourInit(unit,data);
            break;
        case this.behaviourEnums.BasicAttack:
            return this.basicAttackInit(unit,data);
            break;
        case this.behaviourEnums.Wander:
            return this.wanderInit(unit,data);
            break;
        case this.behaviourEnums.SearchInRadius:
            return this.searchInRadiusInit(unit,data);
            break;
        default:
            return this.testBehaviourInit(unit,data);
            break;
    }
}

exports.Behaviour = new Behaviour();
