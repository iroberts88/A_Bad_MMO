
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

exports.Utils = Utils;
