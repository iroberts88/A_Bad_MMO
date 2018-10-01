
var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Unit = require('./unit.js').Unit;
var P = SAT.Polygon,
	V = SAT.Vector,
	C = SAT.Circle;

Character = function(){

    var character = Unit()

    character.init = function (data) {
        this._init(data);
        this.classInfo = null;
        this.spellBook = null;
        this.statistics = null;
        this.slot = data.slot;
    }

    character.update = function(deltaTime){
    	this._update(deltaTime);
    }

    character.getClientData = function(){
    	var data = this._getClientData();

    	return data;
    }
    character.getDBObj = function(){
    	var data = {}

    	return data
    }

    return character;
}
exports.Character = Character;
