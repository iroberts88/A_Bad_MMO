var utils = require('./utils.js').Utils;
var Utils = new utils();
var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1
var Behaviour = require('./behaviour.js').Behaviour;

var V = SAT.Vector;
var P = SAT.Polygon;
var C = SAT.Circle;

//Assign to enemies for Enemy AI

var Behaviour = function() {};

var behaviourEnums = {
    TestBehaviour: 'TestBehaviour',
    Wander: 'wander',
    SearchInRadius: 'searchInRadius',
    BasicAttack: 'basicAttack'
}

//--------------------------------------------------------
//Basic Actions for use in behaviours
//--------------------------------------------------------

Behaviour.prototype.testBehaviour = function(unit,dt,data){
    return null;
}
Behaviour.prototype.basicAttack = function(unit,dt,data){
    //move into melee attack range
    var distance = Math.sqrt(Math.pow(unit.hb.pos.x-unit.currentTarget.meleeHitbox.pos.x,2)+Math.pow(unit.hb.pos.y-unit.currentTarget.meleeHitbox.pos.y,2));
    if (distance > 50){
        if (!unit.stickToTarget){
            unit.setStick(true); //stick on target
        }
        unit.setMoveVector(unit.currentTarget.hb.pos.x-unit.hb.pos.x,unit.currentTarget.hb.pos.y-unit.hb.pos.y,false);
    }
    return null;
}
Behaviour.prototype.wander = function(unit,dt,data){
    var Behaviour = require('./behaviour.js').Behaviour;
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
    if (typeof data.currentPath == 'undefined' || !data.currentPath.length){
        data.currentPath = Behaviour.astar(unit.currentZone.map,unit.currentZone.getTile(unit.hb.pos.x,unit.hb.pos.y),data.openNodes[Math.floor(Math.random()*data.openNodes.length)]);
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
        if (data.nextPosition){
            //check to see if at new position!
            if (Math.abs(unit.hb.pos.x-data.nextPosition[0]) < 10 && Math.abs(unit.hb.pos.y-data.nextPosition[1]) < 10){
                data.currentPath.shift();
                if (!data.currentPath.length){
                    data.waiting = true;
                    data.waitTicker = Math.ceil(Math.random()*3) + 3;
                    unit.setMoveVector(0,0);
                    return null;
                }
                data.nextPosition = [data.currentPath[0].center.x,data.currentPath[0].center.y];
                unit.setMoveVector(data.nextPosition[0]-unit.hb.pos.x,data.nextPosition[1]-unit.hb.pos.y);
            }
        }else{
            //get the new position!
            data.nextPosition = [data.currentPath[0].center.x,data.currentPath[0].center.y];
            unit.setMoveVector(data.nextPosition[0]-unit.hb.pos.x,data.nextPosition[1]-unit.hb.pos.y);
        }
    }

    return null;
}

Behaviour.prototype.searchInRadius = function(unit,dt,data){
    for (var i in unit.nearbyUnits){
        if (Math.sqrt(Math.pow(unit.hb.pos.x-unit.nearbyUnits[i].hb.pos.x,2) + Math.pow(unit.hb.pos.y-unit.nearbyUnits[i].hb.pos.y,2)) <= unit.baseAggroRadius.value && unit != unit.nearbyUnits[i]){
            if (!unit.nearbyUnits[i].isEnemy){
                console.log('GOT TARGET - ' + unit.nearbyUnits[i].name);
                unit.setTarget(unit.nearbyUnits[i])
                unit.setMoveVector(0,0);
                return null;
            }
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
    //returns path array if path exists [node,node,node,...]
    var Behaviour = require('./behaviour.js').Behaviour;

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
            return arr;
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors
        Behaviour.removeGraphNode(openList,currentNode);
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
            // Southwest
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
            }
        }catch(e){
            console.log(x + "," + y);
            console.log(e);
        }

        for(var i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];
            if(Behaviour.findGraphNode(closedList,neighbor) || !neighbor.open) {
                // not a valid node to process, skip to next neighbor
                continue;
            }

            // g score is the shortest distance from start to current node, check if the path we have arrived
            //at this neighbor is the shortest one we have seen yet
            var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
            var gScoreIsBest = false;

            if(!Behaviour.findGraphNode(openList,neighbor)) {
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
    var Behaviour = require('./behaviour.js').Behaviour;
    switch(actionStr) {
        case behaviourEnums.TestBehaviour:
            return Behaviour.testBehaviour(unit,dt,data);
            break;
        case behaviourEnums.BasicAttack:
            return Behaviour.basicAttack(unit,dt,data);
            break;
        case behaviourEnums.Wander:
            return Behaviour.wander(unit,dt,data);
            break;
        case behaviourEnums.SearchInRadius:
            return Behaviour.searchInRadius(unit,dt,data);
            break;
        default:
            return Behaviour.testBehaviour(unit,dt,data);
            break;
    }
}

exports.Behaviour = new Behaviour();
