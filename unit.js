var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Enums = require('./enums.js').Enums,
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

        strength: null, //carry weight, melee power
        stamina: null, //maximum health
        dexterity: null, // ranged power,
        agility: null, // run speed, casting concentrations, AC, Dodge
        wisdom: null, // healing power, mana regen
        intelligence: null, //spell power, skill increase chance, maximum mana
        perception: null, //hit chance, crit chance, dodge, stealth detection
        charisma: null, //buy/sell prices, healing recieved
        spirit: null,
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
        targetOf: {},
        stickToTarget: false,

        currentZone: null,
        currentSector: null,
        currentTile: null,

        _init: function(data){
            //REQUIRED DATA VARIABLES
            this.id = this.engine.getId();
            this.name = data['name'];

            this.sex = data['sex'];
            this.slot = data['slot'];
            this.scale = data['scale'];
            this.moveVector = new V(0,0);

            this.faceVector = new V(0,0);
            this.setStatFormulas(data['classid']);

            if (data['classid'] == 'enemy' || data['classid'] == 'elite'){
                this.isEnemy = true;
                this.noMana = data['noMana'];
                this.cRadius = 2;
                this.hb = new C(new V(500,500), this.cRadius);
            }else{
                this.cRadius = 8;
                this.hb = new C(new V(500,500), this.cRadius);
                this.isEnemy = false;
                this.noMana = false;
            }

            this.jumpSpeed = new Attribute();
            this.jumpSpeed.init({
                id: Enums.JUMPSPEED,
                owner: this,
                value: 1.75,
                min: 0.25,
                max: 3
            });

            this.jumpTime = new Attribute();
            this.jumpTime.init({
                id: Enums.JUMPTIME,
                owner: this,
                value: 1.0,
                min: 0.25,
                max: 3
            });


            this.level = new Attribute();
            this.level.init({
                id: Enums.LEVEL,
                owner: this,
                updateAll: true,
                value: Utils.udCheck(data[Enums.LEVEL],1,data[Enums.LEVEL]),
                min: 1,
                max: 100,
                formula: function(){
                    return this.value;
                }
            });
            this.levelMod = this.level.value/12;

            this.speed = new Attribute();
            this.speed.init({
                id: Enums.SPEED,
                owner: this,
                value: Utils.udCheck(data.speed,75,data.speed),
                min: 0,
                max: 250,
                updateAll: true,
                formula: function(){
                    var inv = this.owner.inventory;
                    var weightMod = Math.max(1,(inv.currentWeight.value/inv.carryWeight.value))
                    this.base = (85+(this.owner.agility.value*(this.owner.level.value/1200)))/(weightMod*weightMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            });

            if (this.isEnemy){
                this.speed.formula = function(){
                    var inv = this.owner.inventory;
                    var weightMod = Math.max(1,(inv.currentWeight.value/inv.carryWeight.value))
                    this.base = (90+(this.owner.agility.value*(this.owner.level.value/1200)))/(weightMod*weightMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            }

            //OPTIONAL DATA VARIABLES
            this.strength = new Attribute();
            this.strength.init({
                id: Enums.STRENGTH,
                owner: this,
                value: Utils.udCheck(data[Enums.STRENGTH],50,data[Enums.STRENGTH]),
                min: 1,
                max: 9999,

                next: function(u){
                    this.owner.meleePower.set(u);
                    this.owner.inventory.carryWeight.set(u);
                }
            });
            this.stamina = new Attribute();
            this.stamina.init({
                id: Enums.STAMINA,
                owner: this,
                value: Utils.udCheck(data[Enums.STAMINA],50,data[Enums.STAMINA]),
                min: 1,
                max: 9999,

                next: function(u){
                    this.owner.maxHealth.set(u);
                }
            });
            this.dexterity = new Attribute();
            this.dexterity.init({
                id: Enums.DEXTERITY,
                owner: this,
                value: Utils.udCheck(data[Enums.DEXTERITY],50,data[Enums.DEXTERITY]),
                min: 1,
                max: 9999,

                next: function(u){
                    this.owner.rangedPower.set(u);
                }
            });
            this.agility = new Attribute();
            this.agility.init({
                id: Enums.AGILITY,
                owner: this,
                value: Utils.udCheck(data[Enums.AGILITY],50,data[Enums.AGILITY]),
                min: 1,
                max: 9999,

                next: function(u){
                    this.owner.speed.set(u);
                    this.owner.ac.set(u);
                }
            });
            this.wisdom = new Attribute();
            this.wisdom.init({
                id: Enums.WISDOM,
                owner: this,
                value: Utils.udCheck(data[Enums.WISDOM],50,data[Enums.WISDOM]),
                min: 1,
                max: 9999,

                next: function(u){
                    this.owner.healingPower.set(u);
                    this.owner.maxMana.set(u);
                }
            });
            this.intelligence = new Attribute();
            this.intelligence.init({
                id: Enums.INTELLIGENCE,
                owner: this,
                value: Utils.udCheck(data[Enums.INTELIIGENCE],50,data[Enums.INTELIIGENCE]),
                min: 1,
                max: 9999,

                next: function(u){
                    this.owner.spellPower.set(u);
                    this.owner.maxMana.set(u);
                }
            });
            this.perception = new Attribute();
            this.perception.init({
                id: Enums.PERCEPTION,
                owner: this,
                value: Utils.udCheck(data[Enums.PERCEPTION],50,data[Enums.PERCEPTION]),
                min: 1,
                max: 9999
            });
            this.charisma = new Attribute();
            this.charisma.init({
                id: Enums.CHARISMA,
                owner: this,
                value: Utils.udCheck(data[Enums.CHARISMA],50,data[Enums.CHARISMA]),
                min: 1,
                max: 9999
            });
            this.luck = new Attribute();
            this.luck.init({
                id: Enums.LUCK,
                owner: this,
                value: Utils.udCheck(data[Enums.LUCK],50,data[Enums.LUCK]),
                min: 1,
                max: 9999
            });
            this.spirit = new Attribute();
            this.spirit.init({
                id: Enums.SPIRIT,
                owner: this,
                value: Utils.udCheck(data[Enums.SPIRIT],50,data[Enums.SPIRIT]),
                min: 1,
                max: 9999
            });

            this.ac = new Attribute();
            this.ac.init({
                id: Enums.AC,
                owner: this,
                value: Utils.udCheck(data[Enums.AC],0,data[Enums.AC]),
                min: 0,
                max: 99999,
                formula: function(){
                    if (this.owner.isEnemy){
                        this.base = (10+this.owner.level.value/2)*(1+this.owner.level.value/2);
                        return Math.round(((this.base*this.pMod)+this.nMod)*(this.owner.agility.value/100));
                    }
                    this.base = 14 + this.owner.level.value;
                    return Math.round(((this.base*this.pMod)+this.nMod)*(this.owner.agility.value/100));
                }
            });

            //only gained from gear/buffs?!
            this.frostRes = new Attribute();
            this.frostRes.init({
                id: Enums.FROSTRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.fireRes = new Attribute();
            this.fireRes.init({
                id: Enums.FIRERES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.earthRes = new Attribute();
            this.earthRes.init({
                id: Enums.EARTHRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.windRes = new Attribute();
            this.windRes.init({
                id: Enums.WINDRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.shockRes = new Attribute();
            this.shockRes.init({
                id: Enums.SHOCKRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.poisonRes = new Attribute();
            this.poisonRes.init({
                id: Enums.POISONRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.diseaseRes = new Attribute();
            this.diseaseRes.init({
                id: Enums.DISEASERES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.shadowRes = new Attribute();
            this.shadowRes.init({
                id: Enums.SHADOWRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.holyRes = new Attribute();
            this.holyRes.init({
                id: Enums.HOLYRES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });
            this.arcaneRes = new Attribute();
            this.arcaneRes.init({
                id: Enums.ARCANERES,
                owner: this,
                value: 0,
                min: 0,
                max: 999
            });


            this.rangedPower = new Attribute();
            this.rangedPower.init({
                id: Enums.RANGEDPOWER,
                owner: this,
                value: Utils.udCheck(data[Enums.RANGEDPOWER],0,data[Enums.RANGEDPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.dexterity.value*(this.owner.level.value/this.owner.rangedStatMod) + this.owner.level.value*this.owner.rangedLvlMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            });
            this.spellPower = new Attribute();
            this.spellPower.init({
                id: Enums.SPELLPOWER,
                owner: this,
                value: Utils.udCheck(data[Enums.SPELLPOWER],0,data[Enums.SPELLPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.intelligence.value*(this.owner.level.value/this.owner.spellStatMod) + this.owner.level.value*this.owner.spellLvlMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            });
            this.meleePower = new Attribute();
            this.meleePower.init({
                id: Enums.MELEEPOWER,
                owner: this,
                value: Utils.udCheck(data[Enums.MELEEPOWER],0,data[Enums.MELEEPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.strength.value*(this.owner.level.value/this.owner.meleeStatMod) + this.owner.level.value*this.owner.meleeLvlMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            });
            this.healingPower = new Attribute();
            this.healingPower.init({
                id: Enums.HEALINGPOWER,
                owner: this,
                value: Utils.udCheck(data[Enums.HEALINGPOWER],0,data[Enums.HEALINGPOWER]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base = (this.owner.wisdom.value*(this.owner.level.value/this.owner.healingStatMod) + this.owner.level.value*this.owner.healingLvlMod);
                    return Math.round(this.base*this.pMod+this.nMod);
                }
            });
            //OTHER
            this.maxHealth = new Attribute();
            this.maxHealth.init({
                id: Enums.MAXHEALTH,
                owner: this,
                value: Utils.udCheck(data[Enums.MAXHEALTH],30,data[Enums.MAXHEALTH]),
                min: 1,
                max: 99999,
                formula: function(){
                    this.base =30+ (this.owner.stamina.value*(this.owner.level.value/this.owner.healthStatMod) + this.owner.level.value*this.owner.healthLvlMod*(this.owner.level.value/this.owner.healthStatMod));
                    return Math.round(this.base*this.pMod+this.nMod);
                },
                next: function(updateClient){
                    //TODO send health percent to all non-allied units
                    this.owner.healthPercent.set(updateClient);
                }
            });
            this.maxMana = new Attribute();
            this.maxMana.init({
                id: Enums.MAXMANA,
                owner: this,
                value: Utils.udCheck(data[Enums.MAXMANA],30,data[Enums.MAXMANA]),
                min: 1,
                updateAll: true,
                max: 99999,
                formula: function(){
                    if (this.owner.noMana){
                        return 0;
                    }
                    this.base =100+this.owner.level.value*14
                    //set the cost base for spells
                    var int = this.owner.intelligence.value;
                    var wis = this.owner.wisdom.value;

                    var statMod = ((int*int+wis*wis)/30)*this.owner.level.value/this.owner.manaStatMod;
                    return Math.ceil((this.base+statMod)*this.pMod+this.nMod);
                },
                next: function(updateClient){
                    //todo send down new mana value
                    if (this.owner.currentMana.value > this.value){
                        this.owner.currentMana.value = this.value;
                        this.owner.currentMana.set(updateClient);
                    }
                }
            });


            this.maxEnergy = new Attribute();
            this.maxEnergy.init({
                id: Enums.MAXENERGY,
                owner: this,
                updateAll: true,
                value: Utils.udCheck(data[Enums.MAXENERGY],100,data[Enums.MAXENERGY]),
                min: 1,
                max: 999
            });
            this.isColliding = true;

            this.copper = Utils.udCheck(data[Enums.COPPER],0,data[Enums.COPPER]);
            this.silver = Utils.udCheck(data[Enums.SILVER],0,data[Enums.SILVER]);
            this.gold = Utils.udCheck(data[Enums.GOLD],0,data[Enums.GOLD]);
            this.platinum = Utils.udCheck(data[Enums.PLATINUM],0,data[Enums.PLATINUM]);
            this.inventory = new Inventory();
            this.inventory.init({
                owner: this
            });

            //initialize equipped weapons of there are any, otherwise use default;
            this.currentMeleeMain = this.defaultWeapon;
            this.currentMeleeSecond = this.defaultWeapon;

            this.currentHealth = new Attribute();
            this.currentHealth.init({
                id: Enums.CURRENTHEALTH,
                owner: this,
                value: Utils.udCheck(data[Enums.CURRENTHEALTH],this.maxHealth.value,data[Enums.CURRENTHEALTH]),
                min: 0,
                max: 99999,
                next: function(updateClient){
                    this.owner.healthPercent.set(updateClient);
                },
                formula: function(){
                    return this.value;
                }
            });
            this.healthPercent = new Attribute();
            this.healthPercent.init({
                id: Enums.HEALTHPERCENT,
                owner: this,
                updateAll: true,
                value: this.currentHealth.value/this.maxHealth.value,
                min: 0,
                max: 1,
                formula: function(updateClient){
                    return this.owner.currentHealth.value/this.owner.maxHealth.value;
                }
            });
            this.currentMana = new Attribute();
            this.currentMana.init({
                id: Enums.CURRENTMANA,
                owner: this,
                updateAll: true,
                value: Utils.udCheck(data[Enums.CURRENTMANA],this.maxMana.value,data[Enums.CURRENTMANA]),
                min: 0,
                max: 99999,
                formula: function(){
                    return this.value;
                }
            });
            this.currentEnergy = new Attribute();
            this.currentEnergy.init({
                id: Enums.CURRENTENERGY,
                owner: this,
                updateAll: true,
                value: Utils.udCheck(data[Enums.CURRENTENERGY],this.maxEnergy.value,data[Enums.CURRENTENERGY]),
                min: 0,
                max: 99999,
                formula: function(){
                    return this.value;
                }
            });
            this.currentExp = new Attribute();
            this.currentExp.init({
                id: Enums.CURRENTEXP,
                owner: this,
                value: Utils.udCheck(data[Enums.CURRENTEXP],0,data[Enums.CURRENTEXP]),
                min: 0,
                max: 99999,
                formula: function(){
                    return this.value;
                }
            });

            for (var i in data.statMods){
                this.modStat({
                    stat: i,
                    value: data.statMods[i]
                },false);
            }

            for (var i in this){
                if (this[i] instanceof Attribute){
                    this[i].set(false);
                    this.statIndex[this[i].id] = this[i];
                }
            }
            this.currentHealth.value = Utils.udCheck(data[Enums.CURRENTHEALTH],this.maxHealth.value,data[Enums.CURRENTHEALTH]);
            this.currentMana.value = Utils.udCheck(data[Enums.CURRENTMANA],this.maxMana.value,data[Enums.CURRENTMANA]);
            this.currentEnergy.value = Utils.udCheck(data[Enums.CURRENTENERGY],this.maxEnergy.value,data[Enums.CURRENTENERGY]);

            this.healthPercent.set(false);


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
            if (this.currentTarget){
                delete this.currentTarget.targetOf[this.id];
            }
            this.currentTarget = unit;
            unit.targetOf[this.id] = this;
            for (var i in this.pToUpdate){
                var data = {};
                data[Enums.UNIT] = this.id;
                data[Enums.TARGET] = unit.id;
                this.engine.queuePlayer(this.pToUpdate[i].owner,Enums.SETTARGET,data);
            }
        },

        clearTarget: function(unit){
            this.setStick(false);
            if (this.currentTarget){
                delete this.currentTarget.targetOf[this.id];
            }
            this.currentTarget = null;
            for (var i in this.pToUpdate){
                var data = {};
                data[Enums.UNIT] = this.id;
                this.engine.queuePlayer(this.pToUpdate[i].owner,Enums.CLEARTARGET,data);
            }
        },

        setMoveVector: function(x,y,updateClient=true,speedMod=1){
            var prevX = this.moveVector.x;
            var prevY = this.moveVector.y;
            this.moveVector.x = x;
            this.moveVector.y = y;
            this.moveVector.normalize();
            this.moveVector.x *= speedMod;
            this.moveVector.y *= speedMod;
            //TODO check if valid move?
            if (updateClient && (prevX != this.moveVector.x || prevY != this.moveVector.y)){
                for (var i in this.pToUpdate){
                    var d = {};
                    d[Enums.ID] = this.id;
                    d[Enums.POSITION] = [this.hb.pos.x,this.hb.pos.y];
                    d[Enums.MOVEVECTOR] = [this.moveVector.x,this.moveVector.y]
                    this.engine.queuePlayer(this.pToUpdate[i].owner,Enums.POSUPDATE, d);
                }
            }
        },
        setStick: function(bool){
            this.stickToTarget = bool;
            for (var i in this.pToUpdate){
                var d = {};
                d[Enums.ID] = this.id;
                d[Enums.BOOL] = bool;
                this.engine.queuePlayer(this.pToUpdate[i].owner,Enums.STICK, d);
            }
        },

        makeWeaponAttack: function(weapon,target,ranged = false){
            if (!target){
                console.log('No Target!!!')
                return 0;
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
                var type = Enums.PIERCE;
            }
            if (weapon.slash && !arr){
                c += weapon.slash[2];
                if (rand <= c){
                    //make a slash attack
                    arr = weapon.slash;
                }
                var type = Enums.SLASH;
            }
            if (weapon.bludgeon && !arr){
                c += weapon.bludgeon[2];
                if (rand <= c){
                    //make a bludgeon attack
                    arr = weapon.bludgeon;
                }
                var type = Enums.BLUDGEON;
            }

            var acrandom = Math.random();
            var attkrandom = Math.random();
            var pwr = ranged ? this.rangedPower.value : this.meleePower.value;
            if (target.ac.value*acrandom < pwr*attkrandom){
                var dmgmod = (pwr*attkrandom) / 100;
                var dmg = Math.ceil(Math.random()*arr[0] + dmgmod*arr[0]);
                //DO ANY WEAPON EFFECTS
                //reduce target hp
                target.damage({
                    value: dmg,
                    type: type,
                    source: this
                })
            }else if (!this.isEnemy){
                var cData = {};
                cData[Enums.UNIT] = target.id;
                cData[Enums.BOOL] = false;
                this.engine.queuePlayer(this.owner,Enums.MISSED,cData);
                if (!target.isEnemy){
                    var cData = {};
                    cData[Enums.UNIT] = this.name;
                    cData[Enums.BOOL] = true;
                    this.engine.queuePlayer(target.owner,Enums.MISSED,cData);
                }
            }else{
                if (!target.isEnemy){
                    var cData = {};
                    cData[Enums.UNIT] = this.name;
                    cData[Enums.BOOL] = true;
                    this.engine.queuePlayer(target.owner,Enums.MISSED,cData);
                }
            }
            for (var i in this.pToUpdate){
                //make a visual weapon swing//shot etc...
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
            var val = data.value;
            var acReduce = Math.min(this.ac.value / (33*data.source.level.value + this.ac.value+400),0.80);
            this.currentHealth.value -= Math.round(val*(1-acReduce));
            this.currentHealth.set(true);
            if (!this.isEnemy){
                //player is being damaged
                var cData = {};
                cData[Enums.UNIT] = data.source.name;
                cData[Enums.STAT] = this.currentHealth.value;
                cData[Enums.VALUE] = data.value;
                cData[Enums.TYPE] = data.type;
                this.engine.queuePlayer(this.owner,Enums.DEALTDAMAGE,cData);
            }
            if (!data.source.isEnemy){
                var cData = {};
                cData[Enums.UNIT] = this.id;
                cData[Enums.VALUE] = data.value;
                cData[Enums.TYPE] = data.type;
                this.engine.queuePlayer(data.source.owner,Enums.DEALDAMAGE,cData);
            }
            if (this.currentHealth.value <= 0){
                this.kill();
            }
        },

        kill: function(){

            for (var i in this.targetOf){
                this.targetOf[i].clearTarget();
            }
            if (this.isEnemy){
                this.spawn.enemyAlive = false;
                this.spawn.ticker = 0;
                this.spawn.currentEnemy = null;

                this.currentZone.removeNPC(this);
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
                    for (var n in zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].npcs){
                        var npc = zone.sectors[(sector.x+i) + 'x' + (sector.y+j)].npcs[n];
                        if (npc != this){
                            this.nearbyUnits[npc.id] = npc;
                        }
                    }
                }
            }
        },

        getTile: function(){
            //return the current map tile
            return this.currentZone.getTile(this.hb.pos.x,this.hb.pos.y);
        },
        _getClientData: function(less = false){

            var data = {};
            data[Enums.NAME] = this.name;
            data[Enums.ID] = this.id;
            if (this.owner){
                data[Enums.OWNER] = this.owner.id;
            }
            data[Enums.POSITION] = [this.hb.pos.x,this.hb.pos.y];
            data[Enums.MOVEVECTOR] = [this.moveVector.x,this.moveVector.y];
            data[Enums.SPEED] = this.speed.value;
            data[Enums.SCALE] = this.scale;
            data[Enums.HEALTHPERCENT] = this.healthPercent.value;
            data[Enums.MAXMANA] = this.maxMana.value;
            data[Enums.CURRENTMANA] = this.currentMana.value;
            data[Enums.CURRENTENERGY] = this.currentEnergy.value;
            data[Enums.MAXENERGY] = this.maxEnergy.value;
            data[Enums.JUMPSPEED] = this.jumpSpeed.value;
            data[Enums.JUMPTIME] = this.jumpTime.value;
            data[Enums.LEVEL] = this.level.value;
            data[Enums.SEX] = this.sex;
            data[Enums.TARGET] = this.currentTarget ? this.currentTarget.id : null;
            data[Enums.STICK] = this.stickToTarget;

            if (less){return data;}
            data[Enums.CURRENTHEALTH] = this.currentHealth.value;
            data[Enums.MAXHEALTH] = this.maxHealth.value;
            data[Enums.STRENGTH] = this.strength.value;
            data[Enums.STAMINA] = this.stamina.value;
            data[Enums.INTELLIGENCE] = this.intelligence.value;
            data[Enums.WISDOM] = this.wisdom.value;
            data[Enums.AGILITY] = this.agility.value;
            data[Enums.DEXTERITY] = this.dexterity.value;
            data[Enums.CHARISMA] = this.charisma.value;
            data[Enums.PERCEPTION] = this.perception.value;
            data[Enums.LUCK] = this.luck.value;
            data[Enums.SPIRIT] = this.spirit.value;
            data[Enums.AC] = this.ac.value;
            data[Enums.MELEEPOWER] = this.meleePower.value;
            data[Enums.HEALINGPOWER] = this.healingPower.value;
            data[Enums.RANGEDPOWER] = this.rangedPower.value;
            data[Enums.SPELLPOWER] = this.spellPower.value;
            data[Enums.CURRENTEXP] = this.currentExp.value;
            data[Enums.FROSTRES] = this.frostRes.value;
            data[Enums.FIRERES] = this.fireRes.value;
            data[Enums.WINDRES] = this.windRes.value;
            data[Enums.EARTHRES] = this.earthRes.value;
            data[Enums.POISONRES] = this.poisonRes.value;
            data[Enums.SHOCKRES] = this.shockRes.value;
            data[Enums.HOLYRES] = this.holyRes.value;
            data[Enums.SHADOWRES] = this.shadowRes.value;
            data[Enums.ARCANERES] = this.arcaneRes.value;
            data[Enums.DISEASERES] = this.diseaseRes.value;
            data[Enums.CURRENTWEIGHT] = this.inventory.currentWeight.value;
            data[Enums.CARRYWEIGHT] = this.inventory.carryWeight.value;

            return data;
        },
        _getLessClientData: function(){
            return this._getClientData(true);
        },
        setStat: function(data,updateClient = true){
            var stat = this.getStat(data.stat);
            console.log(data.value);
            if (!stat){return;}
            stat.base = parseInt(data.value);
            stat.set(updateClient);
        },
        modStat: function(data,updateClient = true){
            var stat = this.getStat(data.stat);
            console.log(data.value);
            if (!stat){return;}
            if (data.isPMod){
                stat.pMod += parseInt(data.value);
            }else{
                stat.nMod = parseInt(data.value);
            }
            stat.set(updateClient);
        },
        getStat: function(stat){
            console.log(stat);
            try{
                //ALL ALTERABLE STATS HERE
                switch (stat){
                    case 'maxWeight':
                        return this.inventory.maxWeight;
                        break;
                    case 'ac':
                        return this.ac;
                        break;
                    case 'maxHealth':
                        return this.maxHealth;
                        break;
                    case 'maxEnergy':
                        return this.maxHealth;
                        break;
                    case 'maxMana':
                        return this.maxMana;
                        break;
                    case 'strength':
                        return this.strength;
                        break;
                    case 'stamina':
                        return this.stamina;
                        break;
                    case 'speed':
                        return this.speed;
                        break;
                    case 'agility':
                        return this.agility;
                        break;
                    case 'dexterity':
                        return this.dexterity;
                        break;
                    case 'intelligence':
                        return this.intelligence;
                        break;
                    case 'wisdom':
                        return this.wisdom;
                        break;
                    case 'spirit':
                        return this.spirit;
                        break;
                    case 'charisma':
                        return this.charisma;
                        break;
                    case 'perception':
                        return this.perception;
                        break;
                    case 'luck':
                        return this.luck;
                        break;
                    default:
                        return null;
                }
            }catch(e){
                console.log('unable to set attribute');
                console.log(e.stack);
            }
        },

        setEngine:  function(e){
            this.engine = e;
        },
        setZone:  function(z){
            this.currentZone = z;
        },
        setSpawn:  function(s){
            this.spawn = s;
            this.setZone(s.zone);
        },
        setOwner:  function(o){
            this.owner = o;
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
