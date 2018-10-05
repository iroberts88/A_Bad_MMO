var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    utils = require('./utils.js').Utils,
    Utils = new utils(),
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

        strength: null, //carry weight, power, melee crit damage
        stamina: null, //maximum health, 
        dexterity: null, // skill, weapon skill increase chance, ranged crit damage
        agility: null, //attack speed, jump, dodge
        wisdom: null, // mana regen
        intelligence: null, //max mana, focus, spell crit damage
        perception: null, //hit chance, crit chance, dodge
        charisma: null, //buy/sell prices, healing crit damage
        luck: null, //slightly effects all actions

        maxHealth: null,
        maxMana: null,
        maxEnurance: null,
        currentHealth: null,
        currentMana: null,
        currentEnurance: null,

        armorClass: null,
        power: null,
        skill: null,
        focus: null,

        level: null,
        currentExp: null,

        //seperate objects for players?
        inventory: null,

        currentZone: null,
        currentSector: null,
        currentTile: null,

        _init: function(data){
            //REQUIRED DATA VARIABLES
            this.engine = data.engine;
            this.id = this.engine.getId();
            this.name = data[this.engine.enums.NAME];
            this.owner = data.owner;
            //OPTIONAL DATA VARIABLES
            this.strength = new Attribute();
            this.strength.init({
                id: this.engine.enums.STRENGTH,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.STRENGTH],50,data[this.engine.enums.STRENGTH]),
                min: 1,
                max: 999
            });
            this.stamina = new Attribute();
            this.stamina.init({
                id: this.engine.enums.STAMINA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.STAMINA],50,data[this.engine.enums.STAMINA]),
                min: 1,
                max: 999
            });
            this.dexterity = new Attribute();
            this.dexterity.init({
                id: this.engine.enums.DEXTERITY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.DEXTERITY],50,data[this.engine.enums.DEXTERITY]),
                min: 1,
                max: 999
            });
            this.agility = new Attribute();
            this.agility.init({
                id: this.engine.enums.AGILITY,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.AGILITY],50,data[this.engine.enums.AGILITY]),
                min: 1,
                max: 999
            });
            this.wisdom = new Attribute();
            this.wisdom.init({
                id: this.engine.enums.WISDOM,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.WISDOM],50,data[this.engine.enums.WISDOM]),
                min: 1,
                max: 999
            });
            this.intelligence = new Attribute();
            this.intelligence.init({
                id: this.engine.enums.INTELIIGENCE,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.INTELIIGENCE],50,data[this.engine.enums.INTELIIGENCE]),
                min: 1,
                max: 999
            });
            this.perception = new Attribute();
            this.perception.init({
                id: this.engine.enums.PERCEPTION,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.PERCEPTION],50,data[this.engine.enums.PERCEPTION]),
                min: 1,
                max: 999
            });
            this.charisma = new Attribute();
            this.charisma.init({
                id: this.engine.enums.CHARISMA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.CHARISMA],50,data[this.engine.enums.CHARISMA]),
                min: 1,
                max: 999
            });
            this.luck = new Attribute();
            this.luck.init({
                id: this.engine.enums.LUCK,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.LUCK],50,data[this.engine.enums.LUCK]),
                min: 1,
                max: 999
            });

            this.ac = new Attribute();
            this.ac.init({
                id: this.engine.enums.AC,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.AC],0,data[this.engine.enums.AC]),
                min: 0,
                max: 99999
            });

            this.frostRes = new Attribute();
            this.frostRes.init({
                id: this.engine.enums.FROSTRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.FROSTRES],0,data[this.engine.enums.FROSTRES]),
                min: 0,
                max: 999
            });
            this.fireRes = new Attribute();
            this.fireRes.init({
                id: this.engine.enums.FIRERES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.FIRERES],0,data[this.engine.enums.FIRERES]),
                min: 0,
                max: 999
            });
            this.earthRes = new Attribute();
            this.earthRes.init({
                id: this.engine.enums.EARTHRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.EARTHRES],0,data[this.engine.enums.EARTHRES]),
                min: 0,
                max: 999
            });
            this.windRes = new Attribute();
            this.windRes.init({
                id: this.engine.enums.WINDRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.WINDRES],0,data[this.engine.enums.WINDRES]),
                min: 0,
                max: 999
            });
            this.shockRes = new Attribute();
            this.shockRes.init({
                id: this.engine.enums.SHOCKRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.SHOCKRES],0,data[this.engine.enums.SHOCKRES]),
                min: 0,
                max: 999
            });
            this.poisonRes = new Attribute();
            this.poisonRes.init({
                id: this.engine.enums.POISONRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.POISONRES],0,data[this.engine.enums.POISONRES]),
                min: 0,
                max: 999
            });
            this.shadowRes = new Attribute();
            this.shadowRes.init({
                id: this.engine.enums.SHADOWRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.SHADOWRES],0,data[this.engine.enums.SHADOWRES]),
                min: 0,
                max: 999
            });
            this.holyRes = new Attribute();
            this.holyRes.init({
                id: this.engine.enums.HOLYRES,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.HOLYRES],0,data[this.engine.enums.HOLYRES]),
                min: 0,
                max: 999
            });

            this.skill = new Attribute();
            this.skill.init({
                id: this.engine.enums.SKILL,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.SKILL],50,data[this.engine.enums.SKILL]),
                min: 1,
                max: 99999
            });
            this.focus = new Attribute();
            this.focus.init({
                id: this.engine.enums.FOCUS,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.FOCUS],50,data[this.engine.enums.FOCUS]),
                min: 1,
                max: 99999
            });
            this.power = new Attribute();
            this.power.init({
                id: this.engine.enums.POWER,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.POWER],50,data[this.engine.enums.POWER]),
                min: 1,
                max: 99999
            });
            //OTHER
            this.maxHealth = new Attribute();
            this.maxHealth.init({
                id: this.engine.enums.MAXHEALTH,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXHEALTH],30,data[this.engine.enums.MAXHEALTH]),
                min: 1,
                max: 99999
            });
            this.currentHealth = Utils.udCheck(data[this.engine.enums.CURRENTHEALTH],this.maxHealth.value,data[this.engine.enums.CURRENTHEALTH]);
            this.maxMana = new Attribute();
            this.maxMana.init({
                id: this.engine.enums.MAXMANA,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXMANA],30,data[this.engine.enums.MAXMANA]),
                min: 1,
                max: 99999
            });
            this.currentMana = Utils.udCheck(data[this.engine.enums.CURRENTMANA],this.maxMana.value,data[this.engine.enums.CURRENTMANA]);

            this.maxEndurance = new Attribute();
            this.maxEndurance.init({
                id: this.engine.enums.MAXENDURANCE,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.MAXENDURANCE],30,data[this.engine.enums.MAXENDURANCE]),
                min: 1,
                max: 99999
            });
            this.currentEndurance = Utils.udCheck(data[this.engine.enums.CURRENTENDURANCE],this.maxEndurance.value,data[this.engine.enums.CURRENTENDURANCE]);

            this.level = Utils.udCheck(data[this.engine.enums.LEVEL],1,data[this.engine.enums.LEVEL]);
            this.currentExp = Utils.udCheck(data[this.engine.enums.CURRENTEXP],0,data[this.engine.enums.CURRENTEXP]);

            this.isColliding = true;
            this.currentZone = null;
            this.currentSector = null;
            this.currentTile = null;
        },
       
        _update: function(deltaTime){
        },

        _getClientData: function(){
            var data = {}
            data[this.engine.enums.NAME] = this.name;
            data[this.engine.enums.ID] = this.id;

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
            data[this.engine.enums.POWER] = this.power.value;
            data[this.engine.enums.SKILL] = this.skill.value;
            data[this.engine.enums.FOCUS] = this.focus.value;
            data[this.engine.enums.MAXHEALTH] = this.maxHealth.value;
            data[this.engine.enums.CURRENTHEALTH] = this.currentHealth;
            data[this.engine.enums.MAXMANA] = this.maxMana.value;
            data[this.engine.enums.CURRENTMANA] = this.currentMana;
            data[this.engine.enums.CURRENTENDURANCE] = this.currentEndurance;
            data[this.engine.enums.MAXENDURANCE] = this.maxEndurance.value;
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

            return data;
        },
        _getLessClientData: function(){
            var data = {}

            return data;
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

    }
}

exports.Unit = Unit;
