
var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Item = require('./inventory.js').Item,
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
        this.dIdleBehaviour = Utils.uniqueCopy(data['idleBehaviour']); //defaults
        this.dCombatBehaviour = Utils.uniqueCopy(data['combatBehaviour']); //defaults
        this.idleBehaviour = Utils.uniqueCopy(data['idleBehaviour']);
        this.combatBehaviour = Utils.uniqueCopy(data['combatBehaviour']);

        this.dIdleBehaviour = Behaviour.initBehaviour(this.dIdleBehaviour['name'],this,this.dIdleBehaviour);
        this.dCombatBehaviour = Behaviour.initBehaviour(this.dCombatBehaviour['name'],this,this.dCombatBehaviour);
        this.idleBehaviour = Behaviour.initBehaviour(this.idleBehaviour['name'],this,this.idleBehaviour);
        this.combatBehaviour = Behaviour.initBehaviour(this.combatBehaviour['name'],this,this.combatBehaviour);


        this.defaultWeapon = new Item();
        this.defaultWeapon.init({
            'magic': false,
            'name': 'Fists',
            'bludgeon': [4,2.5,100]
        });

        this.acquireTarget = Utils.uniqueCopy(data['acquireTarget']);
        this.dAcquireTarget = Utils.uniqueCopy(data['acquireTarget']);
        this.acquireTarget = Behaviour.initBehaviour(this.acquireTarget['name'],this,this.acquireTarget);
        this.dAcquireTarget = Behaviour.initBehaviour(this.dAcquireTarget['name'],this,this.dAcquireTarget);

        this.resource = data['resource'];
        this.hb.pos.x = this.spawn.tile.x*this.spawn.zone.TILE_SIZE+this.spawn.zone.TILE_SIZE/2;
        this.hb.pos.y = this.spawn.tile.y*this.spawn.zone.TILE_SIZE+this.spawn.zone.TILE_SIZE/2;
        var sz = typeof this.engine.enemyDimensions[this.resource] == 'undefined' ? 16 : this.engine.enemyDimensions[this.resource]
        this.meleeHitbox = new C(new V(this.hb.pos.x,this.hb.pos.y),sz/2*this.scale);

        this.nearbyUnits = {}; //list of nearby units to use for acquiretarget behaviours

        this.baseAggroRadius = new Attribute();
        this.baseAggroRadius.init({
            id: 'aggro',
            owner: this,
            value: 300,
            min: 1,
            max: 9999
        });
        this.baseAggroRadius.set();

        this.aggroList = [];

    }

    character.update = function(deltaTime){
        //Do behaviours before the unit update
        //this will get move vector/target etc. before move is attemted
        //update weapons
        if (this.bDelay > 0){
            this.bDelay -= deltaTime;
            return null;
        }
        if (this.attackDelay >0){
            this.attackDelay -= deltaTime;
        }
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
