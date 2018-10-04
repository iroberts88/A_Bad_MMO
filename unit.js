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
        owner: null,

        strength: null, //carry weight, power, crit damage
        endurance: null, //maximum health, 
        dexterity: null, // skill, weapon skill increase chance, crit damage
        agility: null, //attack speed, move speed, jump, dodge
        wisdom: null, // mana, focus for healers
        intelligence: null, //mana, focus for spellcasters
        perception: null, //hit chance, crit chance, dodge
        charisma: null, //buy/sell prices, healing power
        luck: null, //slightly effects all actions

        armorClass: null,
        power: null,
        skill: null,
        focus: null,

        level: null,
        currentExp: null,
        totalExp: null,

        //seperate objects for players?
        inventory: null,

        currentZone: null,
        currentSector: null,
        currentTile: null,

        _init: function(data){
            //REQUIRED DATA VARIABLES
            this.engine = data.engine;
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
            this.AC = new Attribute();
            this.AC.init({
                id: this.engine.enums.AC,
                owner: this,
                value: Utils.udCheck(data[this.engine.enums.AC],50,data[this.engine.enums.AC]),
                min: 1,
                max: 99999
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
        },
       
        

        _update: function(deltaTime){
        },

        _getClientData: function(){
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
