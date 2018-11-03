Player = require('./player.js');
var Entity = require('./entity.js').Entity;
var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1
var P = SAT.Polygon;
var V = SAT.Vector;
var C = SAT.Circle;
//Item and Buff Actions

var Actions = function() {};

var ActionEnums = {
    TestAction: 'testAction'
}


///////////////////////////////////
////        Buff Actions       ////
///////////////////////////////////


Actions.prototype.testAction = function(owner,target,data){
    //add a buff to target
    var buff = {id:data.value}
    target.addBuff(buff,owner,target);
}


Actions.prototype.executeAction = function(actionStr,owner,target,data){
    //return a behaviour based on passed id
    var Actions = require('./actions.js').Actions;
    switch(actionStr) {
        case ActionEnums.TestAction:
            return Actions.testAction(owner,target,data);
            break;
    }
}

exports.Actions = new Actions();