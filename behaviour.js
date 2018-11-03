var utils = require('./utils.js').Utils;
var Utils = new utils();
var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1

var V = SAT.Vector;
var P = SAT.Polygon;
var C = SAT.Circle;

//Assign to enemies for Enemy AI

var Behaviour = function() {};

var behaviourEnums = {
    TestBehaviour: 'TestBehaviour'
}

//--------------------------------------------------------
//Basic Actions for use in behaviours
//--------------------------------------------------------

Behaviour.prototype.testBehaviour = function(unit,dt,data){
    console.log(data);

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
    //init the base map for searching
    for(var x = 0; x < map.width; x++) {
        for(var y = 0; y < map.height; y++) {
            map.BaseMap[x][y].f = 0;
            map.BaseMap[x][y].g = 0;
            map.BaseMap[x][y].h = 0;
            map.BaseMap[x][y].parent = null;
        }
    }

    var openList   = [];
    var closedList = [];
    openList.push(map.BaseMap[start[0]][start[1]]);

    while(openList.length > 0) {
        // Grab the lowest f(x) to process next
        var lowInd = 0;
        for(var i=0; i<openList.length; i++) {
            if(openList[i].f < openList[lowInd].f) { lowInd = i; }
        }
        var currentNode = openList[lowInd];

        if(currentNode.x == end[0] && currentNode.y == end[1]) {
            var curr = currentNode;
            var ret = [];
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            var arr = ret.reverse();
            arr.unshift(map.BaseMap[start[0]][start[1]])
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
            if(map.BaseMap[x-1] && map.BaseMap[x-1][y]) {
                neighbors.push(map.BaseMap[x-1][y]);
            }
            if(map.BaseMap[x+1] && map.BaseMap[x+1][y]) {
                neighbors.push(map.BaseMap[x+1][y]);
            }
            if(map.BaseMap[x][y-1] && map.BaseMap[x][y-1]) {
                neighbors.push(map.BaseMap[x][y-1]);
            }
            if(map.BaseMap[x][y+1] && map.BaseMap[x][y+1]) {
                neighbors.push(map.BaseMap[x][y+1]);
            }
            // Southwest
            if(map.BaseMap[x-1] && map.BaseMap[x-1][y-1]) {
                neighbors.push(map.BaseMap[x-1][y-1]);
            }
            // Southeast
            if(map.BaseMap[x+1] && map.BaseMap[x+1][y-1]) {
                neighbors.push(map.BaseMap[x+1][y-1]);
            }
            // Northwest
            if(map.BaseMap[x-1] && map.BaseMap[x-1][y+1]) {
                neighbors.push(map.BaseMap[x-1][y+1]);
            }
            // Northeast
            if(map.BaseMap[x+1] && map.BaseMap[x+1][y+1]) {
                neighbors.push(map.BaseMap[x+1][y+1]);
            }
        }catch(e){
            console.log(x + "," + y);
            console.log(e);
        }

        for(var i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];
            if(Behaviour.findGraphNode(closedList,neighbor) || neighbor.type == map.WALL) {
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
                var d1 = Math.abs(map.BaseMap[end[0]][end[1]].x - neighbor.x);
                var d2 = Math.abs(map.BaseMap[end[0]][end[1]].y - neighbor.y);
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
    }
}

exports.Behaviour = new Behaviour();
