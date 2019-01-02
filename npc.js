
var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Unit = require('./unit.js').Unit,
    Behaviour = require('./behaviour.js').Behaviour,
    Attribute = require('./attribute.js').Attribute;
var P = SAT.Polygon,
	V = SAT.Vector,
	C = SAT.Circle;

NPC = function(){

    var character = Unit()
    //console.log(player);

    character.init = function (data) {
        this._init(data);
        //get the enemy A.I.
        this.dIdleBehaviour = data.idleBehaviour; //defaults
        this.dCoambatBehaviour = data.combatBehaviour; //defaults
        this.idleBehaviour = data.idleBehaviour;
        this.combatBehaviour = data.combatBehaviour;

        this.acquireTarget = data.acquireTarget;
        this.dAcquireTarget = data.acquireTarget;

        this.resource = data.resource;
        this.spawn = data.spawn;
        this.hb.pos.x = this.spawn.tile.x*this.spawn.zone.TILE_SIZE+this.spawn.zone.TILE_SIZE/2;
        this.hb.pos.y = this.spawn.tile.y*this.spawn.zone.TILE_SIZE+this.spawn.zone.TILE_SIZE/2;
        var sz = typeof this.engine.enemyDimensions[this.resource] == 'undefined' ? 16 : this.engine.enemyDimensions[this.resource]
        this.meleeHitbox = new C(new V(this.hb.pos.x,this.hb.pos.y),sz/2*this.scale);

        this.nearbyUnits = {}; //list of nearby units to use for acquiretarget behaviours

        this.baseAggroRadius = new Attribute();
        this.baseAggroRadius.init({
            id: 'aggro',
            owner: this,
            value: 100,
            min: 1,
            max: 9999
        });
        this.baseAggroRadius.set();

    }

    character.update = function(deltaTime){
        //Do behaviours before the unit update
        //this will get move vector/target etc. before move is attemted
        if (this.currentTarget){
            //do behavoiur
            Behaviour.executeBehaviour(this.combatBehaviour['name'],this,deltaTime,this.combatBehaviour);
        }else{
            Behaviour.executeBehaviour(this.acquireTarget['name'],this,deltaTime,this.acquireTarget);
            Behaviour.executeBehaviour(this.idleBehaviour['name'],this,deltaTime,this.idleBehaviour);
        }
    	this._update(deltaTime);
    }

    character.getClientData = function(less){
        var data = this._getClientData(less);
        data[this.engine.enums.RESOURCE] = this.resource;
        return data;
    }
    character.getLessClientData = function(){
    	var data = this.getClientData(true);
    	return data;
    }
    character.getDBObj = function(){
    	var data = {}

    	return data
    }

    return character;
}
exports.NPC = NPC;
