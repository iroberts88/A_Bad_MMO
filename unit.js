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
        agility: null, // run speed, casting concentrations, AC, Dodge
        wisdom: null, // healing power, mana regen
        intelligence: null, //spell power, skill increase chance, maximum mana
        perception: null, //hit chance, crit chance, dodge, stealth detection
        charisma: null, //buy/sell prices, healing recieved
        luck: null, //slightly effects all actions

        maxHealth: null,
        healthPercent: null,
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
        platinum: null,

        currentMeleeMain: null,
        currentMeleeSecond: null,
        currentRanged: null,

        weapons: [null,null],

        isDualWeilding: false,

        meleeOn: false,
        rangedOn: false,

        attackDelay: 0.0,
        secondaryAttackDelay: 0.0,
        currentZone: null,
        currentSector: null,
        currentTile: null,

        hb: null,
        moveVector: null,
        cRadius: null,

        pToUpdate: [], //the array of players to keep updated of this units position and information

        statIndex: {},

        currentTarget: null,

        _init: function(data){
            //REQUIRED DATA VARIABLES
            this.engine = data.engine;
            this.id = this.engine.getId();
            this.name = data.name;
            this.owner = data.owner;

            this.sex = data.sex;
            this.scale = data.scale;
            this.cRadius = 8;
            this.hb = new C(new V(500,500), this.cRadius);
            this.moveVector = new V(0,0);

            this.faceVector = new V(0,0);
            this.setStatFormulas(data.classid);

            if (data.classid == 'enemy' || data.classid == 'elite'){
                this.isEnemy = true;
                this.noMana = data.noMana;
            }else{
                this.isEnemy = false;
                this.noMana = false;
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
                value: 1.0,
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
                    var inv = this.owner.inventory;
                    var weightMod = Math.max(1,(inv.currentWeight.value/inv.carryWeight.value))
                    this.base = (75+(this.owner.agility.value*(this.owner.level/1200)))/(weightMod*weightMod);
                    return 300//Math.round(this.base*this.pMod+this.nMod);
                }
            });

            if (this.isEnemy){
                this.speed.formula = function(){
                    this.base = 80+(this.owner.agility.value*this.owner.levelMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            }

            //OPTIONAL DATA VARIABLES
            this.strength = new Attribute();
            this.strength.init({
                id: this.engine.enums.STRENGTH,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.STRENGTH],100,data[this.engine.enums.STRENGTH]),
                min: 1,
                max: 999,
                next: function(u){
                    this.owner.meleePower.set(u);
                }
            });
            this.stamina = new Attribute();
            this.stamina.init({
                id: this.engine.enums.STAMINA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.STAMINA],100,data[this.engine.enums.STAMINA]),
                min: 1,
                max: 999,
                next: function(u){
                    this.owner.maxHealth.set(u);
                }
            });
            this.dexterity = new Attribute();
            this.dexterity.init({
                id: this.engine.enums.DEXTERITY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.DEXTERITY],100,data[this.engine.enums.DEXTERITY]),
                min: 1,
                max: 999,
                next: function(u){
                    this.owner.rangedPower.set(u);
                }
            });
            this.agility = new Attribute();
            this.agility.init({
                id: this.engine.enums.AGILITY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.AGILITY],100,data[this.engine.enums.AGILITY]),
                min: 1,
                max: 999,
                next: function(u){
                    this.owner.speed.set(u);
                }
            });
            this.wisdom = new Attribute();
            this.wisdom.init({
                id: this.engine.enums.WISDOM,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.WISDOM],100,data[this.engine.enums.WISDOM]),
                min: 1,
                max: 999,
                next: function(u){
                    this.owner.healingPower.set(u);
                }
            });
            this.intelligence = new Attribute();
            this.intelligence.init({
                id: this.engine.enums.INTELLIGENCE,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.INTELIIGENCE],100,data[this.engine.enums.INTELIIGENCE]),
                min: 1,
                max: 999,
                next: function(u){
                    this.owner.spellPower.set(u);
                    this.owner.maxMana.set(u);
                }
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
                    if (this.owner.isEnemy){
                        //todo enemy AC formula?
                        return Math.round(10*this.pMod+this.nMod);
                    }else{
                        this.base = 14 + this.owner.level;
                        this.cap = this.owner.level*30*Math.ceil(this.owner.level/5);
                        return Math.min(this.owner.level*30*Math.ceil(this.owner.level/2),Math.round((this.base*this.pMod+this.nMod)*(1+this.owner.agility.value*(this.owner.level/8000))));
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
                    return Math.round(this.base*this.pMod+this.nMod);
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
                    return Math.round(this.base*this.pMod+this.nMod);
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
                    return Math.round(this.base*this.pMod+this.nMod);
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
                    return Math.round(this.base*this.pMod+this.nMod);
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
                    return Math.round(this.base*this.pMod+this.nMod);
                },
                next: function(){
                    //TODO send health percent to all non-allied units
                    //etc....
                    this.owner.healthPercent = this.owner.currentHealth/this.owner.maxHealth.value;
                }
            });
            this.maxMana = new Attribute();
            this.maxMana.init({
                id: this.engine.enums.MAXMANA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXMANA],30,data[this.engine.enums.MAXMANA]),
                min: 1,
                max: 99999,
                formula: function(){
                    if (this.owner.noMana){
                        return 0;
                    }
                    this.base =(this.owner.manaLvlMod*10) + this.owner.level*this.owner.manaLvlMod*(this.owner.level/this.owner.manaStatMod);
                    //set the cost base for spells
                    this.costBase = (100) + this.owner.level*10*(this.owner.level/10);
                    var statMod = (this.owner.intelligence.value*2*(this.owner.level/this.owner.manaStatMod));
                    return Math.round((this.base+statMod)*this.pMod+this.nMod);
                },
                next: function(){
                    //todo send down new mana value
                    if (this.owner.currentMana > this.value){
                        this.owner.currentMana = this.value;
                    }
                }
            });


            this.maxEnergy = new Attribute();
            this.maxEnergy.init({
                id: this.engine.enums.MAXENERGY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXENERGY],100,data[this.engine.enums.MAXENERGY]),
                min: 1,
                max: 999
            });
            this.levelMod = this.level/12;
            this.isColliding = true;
            this.currentZone = null;
            this.currentSector = null;
            this.currentTile = null;
            
            this.level = Utils.udCheck(data[this.engine.enums.LEVEL],1,data[this.engine.enums.LEVEL]);

            this.copper = Utils.udCheck(data[this.engine.enums.COPPER],0,data[this.engine.enums.COPPER]);
            this.silver = Utils.udCheck(data[this.engine.enums.SILVER],0,data[this.engine.enums.SILVER]);
            this.gold = Utils.udCheck(data[this.engine.enums.GOLD],0,data[this.engine.enums.GOLD]);
            this.platinum = Utils.udCheck(data[this.engine.enums.PLATINUM],0,data[this.engine.enums.PLATINUM]);
            this.inventory = new Inventory();
            this.inventory.init({
                owner: this
            });

            //initialize equipped weapons of there are any, otherwise use default;
            this.currentMeleeMain = this.defaultWeapon;
            this.currentMeleeSecond = this.defaultWeapon;


            for (var i in data.statMods){
                this.modStat({
                    stat: i,
                    value: data.statMods[i]
                });
            }

            for (var i in this){
                if (this[i] instanceof Attribute){
                    this[i].set();
                    this.statIndex[this[i].id] = this[i];
                }
            }

            this.currentHealth = Utils.udCheck(data[this.engine.enums.CURRENTHEALTH],this.maxHealth.value,data[this.engine.enums.CURRENTHEALTH]);
            this.currentMana = Utils.udCheck(data[this.engine.enums.CURRENTMANA],this.maxMana.value,data[this.engine.enums.CURRENTMANA]);
            this.healthPercent = this.currentHealth/this.maxHealth.value;
            this.currentEnergy = Utils.udCheck(data[this.engine.enums.CURRENTENERGY],this.maxEnergy.value,data[this.engine.enums.CURRENTENERGY]);
            this.currentExp = Utils.udCheck(data[this.engine.enums.CURRENTEXP],0,data[this.engine.enums.CURRENTEXP]);

        },
       
        _update: function(deltaTime){
            //update movement
            if (!this.moveVector.x == 0 || this.moveVector.y != 0){
                this.currentZone.collideUnit(this,deltaTime);
                if (this.currentSector != this.currentZone.getSector(this.hb.pos.x,this.hb.pos.y)){
                    this.currentZone.changeSector(this,this.currentZone.getSector(this.hb.pos.x,this.hb.pos.y));
                }
            }
            this.meleeHitbox.pos.x = this.hb.pos.x;
            this.meleeHitbox.pos.y = this.hb.pos.y;
        },

        setTarget: function(unit){
            this.currentTarget = unit;
            for (var i in this.pToUpdate){
                var data = {};
                data[this.engine.enums.UNIT] = this.id;
                data[this.engine.enums.TARGET] = unit.id;
                this.engine.queuePlayer(this.pToUpdate[i].owner,this.engine.enums.SETTARGET,data);
            }
        },

        clearTarget: function(unit){
            this.currentTarget = null;
            for (var i in this.pToUpdate){
                var data = {};
                data[this.engine.enums.UNIT] = this.id;
                this.engine.queuePlayer(this.pToUpdate[i].owner,this.engine.enums.CLEARTARGET,data);
            }
        },

        makeWeaponAttack: function(weapon,target,ranged = false){
            if (!target){
                console.log('No Target!!!')
                return;
            }
            var arr = null;
            var rand = Math.random() * 100;
            var c = 0;
            var type = '';
            if (weapon.pierce){
                c += weapon.pierce[2];
                if (rand <= c){
                    //make a pierce attack
                    arr = weapon.pierce;
                }
                var type = this.engine.enums.PIERCE;
            }
            if (weapon.slash && !arr){
                c += weapon.slash[2];
                if (rand <= c){
                    //make a slash attack
                    arr = weapon.slash;
                }
                var type = this.engine.enums.SLASH;
            }
            if (weapon.bludgeon && !arr){
                c += weapon.bludgeon[2];
                if (rand <= c){
                    //make a bludgeon attack
                    arr = weapon.bludgeon;
                }
                var type = this.engine.enums.BLUDGEON;
            }

            var acrandom = Math.random();
            var attkrandom = Math.random();
            var pwr = ranged ? this.rangedPower.value : this.meleePower.value;
            if (target.ac.value*acrandom < pwr*attkrandom){
                var dmgmod = (pwr*attkrandom - target.ac.value*acrandom) / 100;
                var dmg = Math.ceil(Math.random()*arr[0] + dmgmod*arr[0]);
                console.log(this.name + ' HIT ' + target.name + ' with ' + weapon.name + ' for ' + dmg + ' ' + type + '  damage!');
                //DO ANY WEAPON EFFECTS
                //reduce target hp
                target.damage({
                    value: dmg,
                    type: type,
                    source: this
                })
            }else if (!this.isEnemy){
                console.log(this.name + ' MISSED ' + target.name + '!');
                var cData = {};
                cData[this.engine.enums.UNIT] = target.id;
                cData[this.engine.enums.BOOL] = false;
                this.engine.queuePlayer(this.owner,this.engine.enums.MISSED,cData);
                if (!target.isEnemy){
                    var cData = {};
                    cData[this.engine.enums.UNIT] = this.name;
                    cData[this.engine.enums.BOOL] = true;
                    this.engine.queuePlayer(target.owner,this.engine.enums.MISSED,cData);
                }
            }else{
                //npc hit something
            }
            return arr[1];
        },

        damage: function(data){
            //damage the unit!
            // -- data.value -- the amount of health to reduce
            // -- data.type -- the type of damage inflicted
            // -- data.source -- the unit making the damaging attack

            //DO any on Damage effects
            //check resistances etc.

            this.currentHealth -= data.value;
            this.healthPercent = this.currentHealth/this.maxHealth.value;
            if (!this.isEnemy){
                //player is being damaged
                var cData = {};
                cData[this.engine.enums.UNIT] = data.source.name;
                cData[this.engine.enums.STAT] = this.currentHealth;
                cData[this.engine.enums.VALUE] = data.value;
                cData[this.engine.enums.TYPE] = data.type;
                this.engine.queuePlayer(this.owner,this.engine.enums.DEALTDAMAGE,cData);
            }
            var clientData = {};
            clientData[this.engine.enums.UNIT] = this.id;
            clientData[this.engine.enums.STAT] = this.engine.enums.HEALTHPERCENT;
            clientData[this.engine.enums.VALUE] = this.healthPercent;
            for (var i in this.pToUpdate){
                //check ally player

                //check enemy player
                this.engine.queuePlayer(this.pToUpdate[i].owner,this.engine.enums.SETUNITSTAT,clientData);
            }
            if (!data.source.isEnemy){
                var cData = {};
                cData[this.engine.enums.UNIT] = this.id;
                cData[this.engine.enums.VALUE] = data.value;
                cData[this.engine.enums.TYPE] = data.type;
                this.engine.queuePlayer(data.source.owner,this.engine.enums.DEALDAMAGE,cData);
            }
            if (this.currentHealth <= 0){
                this.kill();
            }
        },

        kill: function(){
            if (this.isEnemy){
                this.spawn.enemyAlive = false;
                this.spawn.ticker = 0;
                this.spawn.currentEnemy = null;

                this.currentZone.removeNPC(this);
                for (var i in this.pToUpdate){
                    if (this.pToUpdate[i].currentTarget == this){
                        this.pToUpdate[i].clearTarget();
                    }
                }
                console.log('dead');
            }else{
                console.log("Player " + this.name + ' is dead!')
            }
        },

        getPToUpdate: function(){
            var zone = this.currentZone;
            var sector = this.currentSector;
            this.pToUpdate = {};
            for (var i = -1;i < 2;i++){
                for (var j = -1;j < 2;j++){
                    if (typeof zone.sectors[(sector.x+i) + 'x' + (sector.y+j)] == 'undefined'){
                        continue;
                    }
                    for (var pl in zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].players){
                        var player = zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].players[pl];
                        this.pToUpdate[player.id] = player;
                    }
                }
            }
        },

        getNearbyUnits: function(){
            var zone = this.currentZone;
            var sector = this.currentSector;
            this.nearbyUnits = {};
            for (var i = -1;i < 2;i++){
                for (var j = -1;j < 2;j++){
                    if (typeof zone.sectors[(sector.x+i) + 'x' + (sector.y+j)] == 'undefined'){
                        continue;
                    }
                    for (var pl in zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].players){
                        var player = zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].players[pl];
                        this.nearbyUnits[player.id] = player;
                    }
                    for (var n in zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].npc){
                        var npc = zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].npc[n];
                        this.nearbyUnits[npc.id] = npc;
                    }
                }
            }
        },

        _getClientData: function(less){
            var data = {};
            data[this.engine.enums.NAME] = this.name;
            data[this.engine.enums.ID] = this.id;
            data[this.engine.enums.POSITION] = [this.hb.pos.x,this.hb.pos.y];
            data[this.engine.enums.MOVEVECTOR] = [this.moveVector.x,this.moveVector.y];
            data[this.engine.enums.SPEED] = this.speed.value;
            data[this.engine.enums.SCALE] = this.scale;
            data[this.engine.enums.HEALTHPERCENT] = this.healthPercent;
            data[this.engine.enums.MAXMANA] = this.maxMana.value;
            data[this.engine.enums.CURRENTMANA] = this.currentMana;
            data[this.engine.enums.CURRENTENERGY] = this.currentEnergy;
            data[this.engine.enums.MAXENERGY] = this.maxEnergy.value;
            data[this.engine.enums.JUMPSPEED] = this.jumpSpeed.value;
            data[this.engine.enums.JUMPTIME] = this.jumpTime.value;
            data[this.engine.enums.LEVEL] = this.level;
            data[this.engine.enums.SEX] = this.sex;

            if (less && typeof less != 'undefined'){return data;}
            data[this.engine.enums.CURRENTHEALTH] = this.currentHealth;
            data[this.engine.enums.MAXHEALTH] = this.maxHealth.value;
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
            data[this.engine.enums.CURRENTEXP] = this.currentExp;
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
            data[this.engine.enums.CURRENTWEIGHT] = this.inventory.currentWeight.value;
            data[this.engine.enums.CARRYWEIGHT] = this.inventory.carryWeight.value;

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
                        this.inventory.maxWeight.nMod += data.value;
                        this.inventory.maxWeight.set();
                        break;
                    case 'ac':
                        this.ac.nMod += data.value;
                        this.ac.set();
                        break;
                    case 'maxHealth':
                        this.maxHealth.nMod += data.value;
                        this.maxHealth.set();
                        break;
                    case 'strength':
                        this.strength.nMod += data.value;
                        this.strength.set();
                        break;
                    case 'stamina':
                        this.stamina.nMod += data.value;
                        this.stamina.set();
                        break;
                    case 'speed':
                        this.speed.nMod += data.value;
                        this.speed.set();
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
            switch (id){
                case 'enemy':
                    this.healthLvlMod = 5;
                    this.manaLvlMod = 5;
                    this.meleeLvlMod = 10;
                    this.rangedLvlMod = 10;
                    this.spellLvlMod = 10;
                    this.healingLvlMod = 10;

                    this.healthStatMod = 12;
                    this.manaStatMod = 12;
                    this.meleeStatMod = 12;
                    this.rangedStatMod = 12;
                    this.spellStatMod = 12;
                    this.healingStatMod = 12;
                    break;
                case 'elite':
                    this.healthLvlMod = 20;
                    this.manaLvlMod = 20;
                    this.meleeLvlMod = 40;
                    this.rangedLvlMod = 40;
                    this.spellLvlMod = 40;
                    this.healingLvlMod = 40;

                    this.healthStatMod = 8;
                    this.manaStatMod = 8;
                    this.meleeStatMod = 8;
                    this.rangedStatMod = 8;
                    this.spellStatMod = 8;
                    this.healingStatMod = 8;
                    break;
                case 'mage':
                    this.healthLvlMod = 5;
                    this.manaLvlMod = 15;
                    this.meleeLvlMod = 10;
                    this.rangedLvlMod = 8;
                    this.spellLvlMod = 14;
                    this.healingLvlMod = 14;

                    this.healthStatMod = 12;
                    this.manaStatMod = 5;
                    this.meleeStatMod = 14;
                    this.rangedStatMod = 14;
                    this.spellStatMod = 8;
                    this.healingStatMod = 10;
                    break;
                case 'thief':
                    this.healthLvlMod = 5;
                    this.manaLvlMod = 5;
                    this.meleeLvlMod = 14;
                    this.rangedLvlMod = 14;
                    this.spellLvlMod = 10;
                    this.healingLvlMod = 8;

                    this.healthStatMod = 11;
                    this.manaStatMod = 14;
                    this.meleeStatMod = 8;
                    this.rangedStatMod = 9;
                    this.spellStatMod = 14;
                    this.healingStatMod = 14;
                    break;
                case 'fighter':
                    this.healthLvlMod = 7;
                    this.manaLvlMod = 5;
                    this.meleeLvlMod = 14;
                    this.rangedLvlMod = 13;
                    this.spellLvlMod = 8;
                    this.healingLvlMod = 10;

                    this.healthStatMod = 10;
                    this.manaStatMod = 15;
                    this.meleeStatMod = 8;
                    this.rangedStatMod = 10;
                    this.spellStatMod = 14;
                    this.healingStatMod = 14;
                    break;
                case 'priest':
                    this.healthLvlMod = 5;
                    this.manaLvlMod = 14;
                    this.meleeLvlMod = 8;
                    this.rangedLvlMod = 10;
                    this.spellLvlMod = 14;
                    this.healingLvlMod = 14;

                    this.healthStatMod = 12;
                    this.manaStatMod = 14;
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
