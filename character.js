
var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Item = require('./inventory.js').Item,
    Enums = require('./enums.js').Enums,
    Unit = require('./unit.js').Unit,
    Attribute = require('./attribute.js').Attribute;
var P = SAT.Polygon,
	V = SAT.Vector,
	C = SAT.Circle;

Character = function(){

    var character = Unit()

    character.init = function (data) {
        this.defaultWeapon = new Item();
        this.defaultWeapon.init({
            'magic': false,
            'name': 'Fists',
            'bludgeon': [4,3.5,100]
        });
        this._init(data);
        this.classInfo = null;
        this.spellBook = null;
        this.statistics = null;
        this.slot = data['slot'];
        this.class = data['class'];
        this.race = data['race'];
        this.zoneid = 'test1';
        this.meleeHitbox = new C(new V(this.hb.pos.x,this.hb.pos.y),24);
    }
    character.setRace = function(){
        var race = this.engine.races[this.race];
        for (var i in race.attributes){
            this.setStat({stat:i,value:race.attributes[i]},false)
        }
    }
    character.setClass = function(){
        console.log(this.class);
        console.log(this.engine.classes);
        var c = this.engine.classes[this.class];
        for (var i in c.statMods){
            this.modStat({stat:i,value:c.statMods[i]},false)
        }
    }
    character.update = function(deltaTime){
    	this._update(deltaTime);
        //update weapons
        if (this.attackDelay >0){
            this.attackDelay -= deltaTime;
        }
        if (this.secondaryAttackDelay >0){
            this.secondaryAttackDelay -= deltaTime;
        }
        //attack if able
        if (this.currentTarget && (this.meleeOn || this.rangedOn)){
            var range = [0,0];
            if (this.rangedOn){
                if (!this.currentRanged){
                    return;
                }
                this.weapons[0] = this.currentRanged;
                this.weapons[1] = null;
                range[0] = this.currentRanged.range[0];
                range[1] = this.currentRanged.range[1];
            }
            if (this.meleeOn){
                this.weapons[0] = this.currentMeleeMain;
                this.weapons[1] = this.currentMeleeSecond;
                range[0] = -Infinity;
                range[1] = 50; //DEFAULT MELEE RANGE???
            }
            //get proper range
            var distance = Math.sqrt(Math.pow(this.hb.pos.x-this.currentTarget.meleeHitbox.pos.x,2)+Math.pow(this.hb.pos.y-this.currentTarget.meleeHitbox.pos.y,2))
            distance -= this.currentTarget.meleeHitbox.r;
            if (distance < range[0]){
                //you are too close!!!
                return;
            }else if (distance > range[1]){
                //you are too far away!!
                return;
            }
            if (this.attackDelay <=0){
                //attack with melee OR ranged
                //make the attack
                this.attackDelay = this.makeWeaponAttack(this.weapons[0],this.currentTarget,this.rangedOn);
            }
            if (this.secondaryAttackDelay <=0 && this.weapons[1]){
                //make the attack
                this.secondaryAttackDelay = this.makeWeaponAttack(this.weapons[1],this.currentTarget);
            }
        }

    }

    character.levelUp = function(less){
        this.level.value += 1;
        this.level.set(true);
        this.strength.set(true);
        this.stamina.set(true);
        this.intelligence.set(true);
        this.wisdom.set(true);
        this.agility.set(true);
        this.dexterity.set(true);
        this.charisma.set(true);
        this.perception.set(true);
        this.luck.set(true);
        this.currentHealth.value = this.maxHealth.value;
        this.currentHealth.set(true);
        this.currentMana.value = this.maxMana.value;
        this.currentMana.set(true);
        this.currentEnergy.value = this.maxEnergy.value;
        this.currentEnergy.set(true);
    }

    character.getClientData = function(less = false){
    	var data = this._getClientData(less);
        data[Enums.SLOT] = this.slot;
        data[Enums.CLASS] = this.class;
        data[Enums.RACE] = this.race;
        data[Enums.OWNER] = this.owner.id;
    	return data;
    }

    character.getLessClientData = function(){
        var data = this._getLessClientData();
        data[Enums.CLASS] = this.class;
        data[Enums.RACE] = this.race;
        data[Enums.OWNER] = this.owner.id;
        return data;
    }

    character.getDBObj = function(){
    	var data = {}

    	return data
    }

    return character;
}
exports.Character = Character;
