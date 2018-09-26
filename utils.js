
var Utils = function() {};

Utils.prototype.armorReduce = function(dmg,armor, attackerLevel) {
//Return new damage value after reducing by armor
    var newDmg = Math.ceil(dmg*(1-((1 / (0.01 + (0.9*(0.2+ (0.022*attackerLevel)) / armor))*0.01))));
    return newDmg;
}

exports.Utils = Utils;
