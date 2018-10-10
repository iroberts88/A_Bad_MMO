
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
        this.slot = data[this.engine.enums.SLOT];
        this.class = data[this.engine.enums.CLASS];
        this.race = data[this.engine.enums.RACE];
        this.zoneid = 'test1';
        this.sectorid = '0x0';
        this.hb = new C(new V(0,0), 20);
    }

    character.update = function(deltaTime){
    	this._update(deltaTime);
    }

    character.getClientData = function(){
    	var data = this._getClientData();
        data[this.engine.enums.SLOT] = this.slot;
        data[this.engine.enums.CLASS] = this.class;
        data[this.engine.enums.RACE] = this.race;
    	return data;
    }
    character.getDBObj = function(){
    	var data = {}

    	return data
    }

    return character;
}
exports.Character = Character;
