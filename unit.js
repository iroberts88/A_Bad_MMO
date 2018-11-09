var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Inventory = require('./inventory.js').Inventory,
    Attribute = require('./attribute.js').Attribute;

var P = SAT.Polygon,
    V = SAT.Vector,
    C = SAT.Circle;

function Unit() {
    
    return {
        engine: null,
        name: null,
        id: null,
        owner: null,

        strength: null, //carry weight, melee power, melee crit damage
        stamina: null, //maximum health
        dexterity: null, // ranged power, weapon skill increase chance, ranged crit damage
        agility: null, //attack speed, run speed,  jump, dodge, casting concentrations
        wisdom: null, // healing power
        intelligence: null, //spell power, skill increase chance
        perception: null, //hit chance, crit chance, dodge, stealth detection
        charisma: null, //buy/sell prices, healing recieved
        luck: null, //slightly effects all actions

        maxHealth: null,
        maxMana: null,
        maxEnergy: null,
        currentHealth: null,
        currentMana: null,
        currentEnergy: null,

        healthLvlMod: null,
        meleeLvlMod: null,
        rangedLvlMod: null,
        spellLvlMod: null,
        healingLvlMod: null,
        acLvlMod: null,

        healthStatMod: null,
        meleeStatMod: null,
        rangedStatMod: null,
        spellStatMod: null,
        healingStatMod: null,

        ac: null,
        meleePower: null,
        rangedPower: null,
        spellPower: null,
        healingPower: null,

        jumpSpeed: null,
        jumpTime: null,

        jumping: null,

        isEnemy: null,

        level: null,
        currentExp: null,

        //seperate objects for players?
        inventory: null,
        copper: null,
        silver: null,
        gold: null,
        electrum: null,
        platinum: null,

        currentZone: null,
        currentSector: null,
        currentTile: null,

        hb: null,
        moveVector: null,
        cRadius: null,

        pToUpdate: [], //the array of players to keep updated of this units position

        _init: function(data){
            //REQUIRED DATA VARIABLES
            this.engine = data.engine;
            this.id = this.engine.getId();
            this.name = data.name;
            this.owner = data.owner;

            this.cRadius = 8;
            this.hb = new C(new V(500,500), this.cRadius);
            this.moveVector = new V(0,0);

            this.setStatFormulas(data.classid);

            if (data.classid == 'enemy' || data.classid == 'elite'){
                this.isEnemy = true;
            }else{
                this.isEnemy = false;
            }

            this.jumpSpeed = new Attribute();
            this.jumpSpeed.init({
                id: this.engine.enums.JUMPSPEED,
                owner: this,
                value: 1.75,
                min: 0.25,
                max: 3
            });

            this.jumpTime = new Attribute();
            this.jumpTime.init({
                id: this.engine.enums.JUMPTIME,
                owner: this,
                value: 1.25,
                min: 0.25,
                max: 3
            });

            this.speed = new Attribute();
            this.speed.init({
                id: this.engine.enums.SPEED,
                owner: this,
                value: Utils.udCheck(data.speed,75,data.speed),
                min: 0,
                max: 250,
                formula: function(){
                    this.base = 75+(this.owner.agility.value*(this.owner.level/1200));
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            });

            if (this.isEnemy){
                this.speed.formula = function(){
                    this.base = 80+(this.owner.agility.value*this.owner.levelMod);
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            }

            //OPTIONAL DATA VARIABLES
            this.strength = new Attribute();
            this.strength.init({
                id: this.engine.enums.STRENGTH,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.STRENGTH],100,data[this.engine.enums.STRENGTH]),
                min: 1,
                max: 999
            });
            this.stamina = new Attribute();
            this.stamina.init({
                id: this.engine.enums.STAMINA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.STAMINA],100,data[this.engine.enums.STAMINA]),
                min: 1,
                max: 999
            });
            this.dexterity = new Attribute();
            this.dexterity.init({
                id: this.engine.enums.DEXTERITY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.DEXTERITY],100,data[this.engine.enums.DEXTERITY]),
                min: 1,
                max: 999
            });
            this.agility = new Attribute();
            this.agility.init({
                id: this.engine.enums.AGILITY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.AGILITY],100,data[this.engine.enums.AGILITY]),
                min: 1,
                max: 999
            });
            this.wisdom = new Attribute();
            this.wisdom.init({
                id: this.engine.enums.WISDOM,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.WISDOM],100,data[this.engine.enums.WISDOM]),
                min: 1,
                max: 999
            });
            this.intelligence = new Attribute();
            this.intelligence.init({
                id: this.engine.enums.INTELIIGENCE,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.INTELIIGENCE],100,data[this.engine.enums.INTELIIGENCE]),
                min: 1,
                max: 999
            });
            this.perception = new Attribute();
            this.perception.init({
                id: this.engine.enums.PERCEPTION,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.PERCEPTION],100,data[this.engine.enums.PERCEPTION]),
                min: 1,
                max: 999
            });
            this.charisma = new Attribute();
            this.charisma.init({
                id: this.engine.enums.CHARISMA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.CHARISMA],100,data[this.engine.enums.CHARISMA]),
                min: 1,
                max: 999
            });
            this.luck = new Attribute();
            this.luck.init({
                id: this.engine.enums.LUCK,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.LUCK],100,data[this.engine.enums.LUCK]),
                min: 1,
                max: 999
            });

            this.ac = new Attribute();
            this.ac.init({
                id: this.engine.enums.AC,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.AC],0,data[this.engine.enums.AC]),
                min: 0,
                max: 99999,
                formula: function(){
                    //todo players will be based on inventory!
                    if (this.owner.isEnemy){
                        return 10;
                    }else{
                        return 30;
                    }
                }
            });

            //only gained from gear/buffs?!
            this.frostRes = new Attribute();
            this.frostRes.init({
                id: this.engine.enums.FROSTRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.fireRes = new Attribute();
            this.fireRes.init({
                id: this.engine.enums.FIRERES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.earthRes = new Attribute();
            this.earthRes.init({
                id: this.engine.enums.EARTHRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.windRes = new Attribute();
            this.windRes.init({
                id: this.engine.enums.WINDRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.shockRes = new Attribute();
            this.shockRes.init({
                id: this.engine.enums.SHOCKRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.poisonRes = new Attribute();
            this.poisonRes.init({
                id: this.engine.enums.POISONRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.diseaseRes = new Attribute();
            this.diseaseRes.init({
                id: this.engine.enums.DISEASERES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.shadowRes = new Attribute();
            this.shadowRes.init({
                id: this.engine.enums.SHADOWRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.holyRes = new Attribute();
            this.holyRes.init({
                id: this.engine.enums.HOLYRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.arcaneRes = new Attribute();
            this.arcaneRes.init({
                id: this.engine.enums.ARCANERES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });


            this.rangedPower = new Attribute();
            this.rangedPower.init({
                id: this.engine.enums.RANGEDPOWER,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.RANGEDPOWER],0,data[this.engine.enums.RANGEDPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.dexterity.value*(this.owner.level/this.owner.rangedStatMod) + this.owner.level*this.owner.rangedLvlMod);
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            });
            this.spellPower = new Attribute();
            this.spellPower.init({
                id: this.engine.enums.SPELLPOWER,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.SPELLPOWER],0,data[this.engine.enums.SPELLPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.intelligence.value*(this.owner.level/this.owner.spellStatMod) + this.owner.level*this.owner.spellLvlMod);
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            });
            this.meleePower = new Attribute();
            this.meleePower.init({
                id: this.engine.enums.MELEEPOWER,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MELEEPOWER],0,data[this.engine.enums.MELEEPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.strength.value*(this.owner.level/this.owner.meleeStatMod) + this.owner.level*this.owner.meleeLvlMod);
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            });
            this.healingPower = new Attribute();
            this.healingPower.init({
                id: this.engine.enums.HEALINGPOWER,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.HEALINGPOWER],0,data[this.engine.enums.HEALINGPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.wisdom.value*(this.owner.level/this.owner.healingStatMod) + this.owner.level*this.owner.healingLvlMod);
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            });
            //OTHER
            this.maxHealth = new Attribute();
            this.maxHealth.init({
                id: this.engine.enums.MAXHEALTH,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXHEALTH],30,data[this.engine.enums.MAXHEALTH]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base =30+ (this.owner.stamina.value*(this.owner.level/this.owner.healthStatMod) + this.owner.level*this.owner.healthLvlMod*(this.owner.level/this.owner.healthStatMod));
                    return Math.round((this.base+this.nMod)*this.pMod);
                }
            });
            this.maxMana = new Attribute();
            this.maxMana.init({
                id: this.engine.enums.MAXMANA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXMANA],30,data[this.engine.enums.MAXMANA]),
                min: 1,
                max: 99999
            });
            this.currentMana = Utils.udCheck(data[this.engine.enums.CURRENTMANA],this.maxMana.value,data[this.engine.enums.CURRENTMANA]);

            this.maxEnergy = new Attribute();
            this.maxEnergy.init({
                id: this.engine.enums.MAXENERGY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXENERGY],100,data[this.engine.enums.MAXENERGY]),
                min: 1,
                max: 999
            });
            this.currentEnergy = Utils.udCheck(data[this.engine.enums.CURRENTENERGY],this.maxEnergy.value,data[this.engine.enums.CURRENTENERGY]);

            this.level = Utils.udCheck(data[this.engine.enums.LEVEL],1,data[this.engine.enums.LEVEL]);
            this.currentExp = Utils.udCheck(data[this.engine.enums.CURRENTEXP],0,data[this.engine.enums.CURRENTEXP]);

            this.levelMod = this.level/12;
            this.isColliding = true;
            this.currentZone = null;
            this.currentSector = null;
            this.currentTile = null;

            this.inventory = new Inventory();
            this.inventory.init({
                owner: this
            });

            for (var i in this){
                if (this[i] instanceof Attribute){
                    this[i].set();
                }
            }
            this.currentHealth = Utils.udCheck(data[this.engine.enums.CURRENTHEALTH],this.maxHealth.value,data[this.engine.enums.CURRENTHEALTH]);
        },
       
        _update: function(deltaTime){
            if (!this.moveVector.x == 0 || this.moveVector.y != 0){
                this.currentZone.collideUnit(this,deltaTime);
                if (this.currentSector != this.currentZone.getSector(this.hb.pos.x,this.hb.pos.y)){
                    this.currentZone.changeSector(this,this.currentZone.getSector(this.hb.pos.x,this.hb.pos.y));
                }
            }
        },

        _getClientData: function(less){
            var data = {}
            data[this.engine.enums.NAME] = this.name;
            data[this.engine.enums.ID] = this.id;
            data[this.engine.enums.POSITION] = [this.hb.pos.x,this.hb.pos.y];
            data[this.engine.enums.MOVEVECTOR] = [this.moveVector.x,this.moveVector.y];
            data[this.engine.enums.SPEED] = this.speed.value;

            if (less && typeof less != 'undefined'){return data;}
            data[this.engine.enums.STRENGTH] = this.strength.value;
            data[this.engine.enums.STAMINA] = this.stamina.value;
            data[this.engine.enums.INTELLIGENCE] = this.intelligence.value;
            data[this.engine.enums.WISDOM] = this.wisdom.value;
            data[this.engine.enums.AGILITY] = this.agility.value;
            data[this.engine.enums.DEXTERITY] = this.dexterity.value;
            data[this.engine.enums.CHARISMA] = this.charisma.value;
            data[this.engine.enums.PERCEPTION] = this.perception.value;
            data[this.engine.enums.LUCK] = this.luck.value;
            data[this.engine.enums.AC] = this.ac.value;
            data[this.engine.enums.MELEEPOWER] = this.meleePower.value;
            data[this.engine.enums.HEALINGPOWER] = this.healingPower.value;
            data[this.engine.enums.RANGEDPOWER] = this.rangedPower.value;
            data[this.engine.enums.SPELLPOWER] = this.spellPower.value;
            data[this.engine.enums.MAXHEALTH] = this.maxHealth.value;
            data[this.engine.enums.CURRENTHEALTH] = this.currentHealth;
            data[this.engine.enums.MAXMANA] = this.maxMana.value;
            data[this.engine.enums.CURRENTMANA] = this.currentMana;
            data[this.engine.enums.CURRENTENERGY] = this.currentEnergy;
            data[this.engine.enums.MAXENERGY] = this.maxEnergy.value;
            data[this.engine.enums.CURRENTEXP] = this.currentExp;
            data[this.engine.enums.LEVEL] = this.level;
            data[this.engine.enums.FROSTRES] = this.frostRes.value;
            data[this.engine.enums.FIRERES] = this.fireRes.value;
            data[this.engine.enums.WINDRES] = this.windRes.value;
            data[this.engine.enums.EARTHRES] = this.earthRes.value;
            data[this.engine.enums.POISONRES] = this.poisonRes.value;
            data[this.engine.enums.SHOCKRES] = this.shockRes.value;
            data[this.engine.enums.HOLYRES] = this.holyRes.value;
            data[this.engine.enums.SHADOWRES] = this.shadowRes.value;
            data[this.engine.enums.ARCANERES] = this.arcaneRes.value;
            data[this.engine.enums.DISEASERES] = this.diseaseRes.value;
            data[this.engine.enums.JUMPSPEED] = this.jumpSpeed.value;
            data[this.engine.enums.JUMPTIME] = this.jumpTime.value;
            data[this.engine.enums.CURRENTWEIGHT] = this.inventory.currentWeight.value;

            return data;
        },
        _getLessClientData: function(){
            return this._getClientData(true);
        },

        modStat: function(data){
            //data.stat = the stat to be modded
            //data.set = if true, set stat to value instead of adding
            //data.value = the value to modify the stat
            if (typeof data.set == 'undefined'){data.set = false}
            try{
                //ALL ALTERABLE STATS HERE
                switch (data.stat){
                    case 'maxWeight':
                        this.inventory.maxWeight.base += data.value;
                        this.inventory.maxWeight.set();
                        break;
                }
            }catch(e){
                console.log('unable to set attribute');
                console.log(data);
                console.log(e.stack);
            }
        },

        setGameSession: function(se) {
            this.session = se;
            this.engine = se.engine;
        },
        setStatFormulas: function(id){
            //Lvl mods increase the amount gained based on level (higher = more pwr)
            //Stat mods increase the amount based on the corresponding stat (lower = more pwr)
            console.log(id);
            switch (id){
                case 'enemy':
                    this.healthLvlMod = 5;
                    this.meleeLvlMod = 10;
                    this.rangedLvlMod = 10;
                    this.spellLvlMod = 10;
                    this.healingLvlMod = 10;

                    this.healthStatMod = 12;
                    this.meleeStatMod = 12;
                    this.rangedStatMod = 12;
                    this.spellStatMod = 12;
                    this.healingStatMod = 12;
                    break;
                case 'elite':
                    this.healthLvlMod = 20;
                    this.meleeLvlMod = 40;
                    this.rangedLvlMod = 40;
                    this.spellLvlMod = 40;
                    this.healingLvlMod = 40;

                    this.healthStatMod = 8;
                    this.meleeStatMod = 8;
                    this.rangedStatMod = 8;
                    this.spellStatMod = 8;
                    this.healingStatMod = 8;
                    break;
                case 'mage':
                    this.healthLvlMod = 5;
                    this.meleeLvlMod = 10;
                    this.rangedLvlMod = 8;
                    this.spellLvlMod = 14;
                    this.healingLvlMod = 14;

                    this.healthStatMod = 12;
                    this.meleeStatMod = 14;
                    this.rangedStatMod = 14;
                    this.spellStatMod = 8;
                    this.healingStatMod = 10;
                    break;
                case 'thief':
                    this.healthLvlMod = 5;
                    this.meleeLvlMod = 14;
                    this.rangedLvlMod = 14;
                    this.spellLvlMod = 10;
                    this.healingLvlMod = 8;

                    this.healthStatMod = 11;
                    this.meleeStatMod = 8;
                    this.rangedStatMod = 9;
                    this.spellStatMod = 14;
                    this.healingStatMod = 14;
                    break;
                case 'fighter':
                    this.healthLvlMod = 7;
                    this.meleeLvlMod = 14;
                    this.rangedLvlMod = 13;
                    this.spellLvlMod = 8;
                    this.healingLvlMod = 10;

                    this.healthStatMod = 10;
                    this.meleeStatMod = 8;
                    this.rangedStatMod = 10;
                    this.spellStatMod = 14;
                    this.healingStatMod = 14;
                    break;
                case 'priest':
                    this.healthLvlMod = 5;
                    this.meleeLvlMod = 8;
                    this.rangedLvlMod = 10;
                    this.spellLvlMod = 14;
                    this.healingLvlMod = 14;

                    this.healthStatMod = 12;
                    this.meleeStatMod = 14;
                    this.rangedStatMod = 14;
                    this.spellStatMod = 9;
                    this.healingStatMod = 8;
                    break;

            }
        }
    }
}

exports.Unit = Unit;
