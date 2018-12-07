var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Attribute = require('./attribute.js').Attribute;
var P = SAT.Polygon;
var V = SAT.Vector;
var C = SAT.Circle;
//Item and Buff Actions

var Actions = function() {};

var ActionEnums = {
    AlterStat: 'alterStat',
    AlterStatByPercent: 'alterStatByPercent',
    TestAction: 'testAction'
}


///////////////////////////////////
////        Buff Actions       ////
///////////////////////////////////

//owner = the owner of the action
//target = the target the action will act upon

Actions.prototype.testAction = function(data){
    //add a buff to target
    var buff = {id:data.value}
    //target.addBuff(buff,owner,target);
}

Actions.prototype.alterStat = function(data){
    //alter the unit's stats nMod
    //REQ data.unit = the unit to act upon
    //REQ data.value = the value to alter the stat by
    //data.reverse = the stat alter is being reversed
    var stat = data.unit.statIndex[data.stat];
    if (stat instanceof Attribute){
        if (data.reverse){
            stat.nMod -= data.value;
        }else{
            stat.nMod += data.value;
        }
        stat.set(true);
    }else{
        console.log("ERROR: stat <" + data.stat + "> not found");
    }
}
Actions.prototype.alterStatByPercent = function(data){
    //alter the unit's stats pMod
    //REQ data.unit = the unit to act upon
    //REQ data.value = the value to alter the stat by
    //data.reverse = the stat alter is being reversed
    var stat = data.unit.statIndex[data.stat];
    if (stat instanceof Attribute){
        if (data.reverse){
            stat.pMod -= data.value;
        }else{
            stat.pMod += data.value;
        }
        stat.set(true);
    }else{
        console.log("ERROR: stat <" + data.stat + "> not found");
    }
}


Actions.prototype.executeAction = function(actionStr,data){
    //execute an action based on passed id
    var Actions = require('./actions.js').Actions;
    switch(actionStr) {
        case ActionEnums.AlterStat:
            Utils.udCheck(data.reverse,false,data.reverse);
            return Actions.alterStat(data);
            break;
        case ActionEnums.AlterStatByPercent:
            Utils.udCheck(data.reverse,false,data.reverse);
            return Actions.alterStatByPercent(data);
            break;
        case ActionEnums.TestAction:
            return Actions.testAction(data);
            break;
    }
}

exports.Actions = new Actions();