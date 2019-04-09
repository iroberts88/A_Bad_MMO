
var Utils = function() {};

Utils.prototype.armorReduce = function(dmg,armor, attackerLevel) {
//Return new damage value after reducing by armor
    var newDmg = Math.ceil(dmg*(1-((1 / (0.01 + (0.9*(0.2+ (0.022*attackerLevel)) / armor))*0.01))));
    return newDmg;
}

Utils.prototype.udCheck = function(val,tVal,fVal) {
	var result = typeof val == 'undefined' ? tVal : fVal;
    return result;
}

Utils.prototype._udCheck = function(val) {
	return (typeof val == 'undefined');
}

Utils.prototype.uniqueCopy = function(obj){
	var newObj = {}
	for (var key in obj){
		newObj[key] = obj[key];
	}
	return newObj;
}

Utils.prototype.createClientData = function(){
    //Iterates through arguments given and returns a client data object
    //arg1 = object key
    //arg2 = data from arg1
    //e.g. createClientData(arg1,arg2,arg1,arg2...)
    var data = {};
    for (var i = 0; i < arguments.length;i+=2){
        data[arguments[i]] = arguments[i+1];
    }
    return data;
}

exports.Utils = Utils;
