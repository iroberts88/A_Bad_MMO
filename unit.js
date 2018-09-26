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
        skills: null,
        inventory: null,

        //seperate objects for AI
        unitAI: null,

        _init: function(data){
            //REQUIRED DATA VARIABLES
            this.engine = data.engine;
            this.owner = data.owner;
            //OPTIONAL DATA VARIABLES
            this.strength = new Attribute();
            this.strength.init({
                'id': 'str',
                'owner': this,
                'value': typeof data.strength == 'undefined' ? 50 : data.strength,
                'min': 1,
                'max': 999
            });
            this.endurance = new Attribute();
            this.endurance.init({
                'id': 'end',
                'owner': this,
                'value': typeof data.endurance == 'undefined' ? 50 : data.endurance,
                'min': 1,
                'max': 999
            });
            this.dexterity = new Attribute();
            this.dexterity.init({
                'id': 'dex',
                'owner': this,
                'value': typeof data.dexterity == 'undefined' ? 50 : data.dexterity,
                'min': 1,
                'max': 999
            });
            this.agility = new Attribute();
            this.agility.init({
                'id': 'agi',
                'owner': this,
                'value': typeof data.agility == 'undefined' ? 50 : data.agility,
                'min': 1,
                'max': 999
            });
            this.wisdom = new Attribute();
            this.wisdom.init({
                'id': 'wis',
                'owner': this,
                'value': typeof data.wisdom == 'undefined' ? 50 : data.wisdom,
                'min': 1,
                'max': 999
            });
            this.intelligence = new Attribute();
            this.intelligence.init({
                'id': 'int',
                'owner': this,
                'value': typeof data.intelligence == 'undefined' ? 50 : data.intelligence,
                'min': 1,
                'max': 999
            });
            this.perception = new Attribute();
            this.perception.init({
                'id': 'per',
                'owner': this,
                'value': typeof data.perception == 'undefined' ? 50 : data.perception,
                'min': 1,
                'max': 999
            });
            this.charisma = new Attribute();
            this.charisma.init({
                'id': 'cha',
                'owner': this,
                'value': typeof data.charisma == 'undefined' ? 50 : data.charisma,
                'min': 1,
                'max': 999
            });
            this.luck = new Attribute();
            this.luck.init({
                'id': 'luc',
                'owner': this,
                'value': typeof data.luck == 'undefined' ? 50 : data.luck,
                'min': 1,
                'max': 999
            });
            this.AC = new Attribute();
            this.AC.init({
                'id': 'AC',
                'owner': this,
                'value': typeof data.AC == 'undefined' ? 1 : data.AC,
                'min': 1,
                'max': 99999
            });
            this.skill = new Attribute();
            this.skill.init({
                'id': 'ski',
                'owner': this,
                'value': typeof data.skill == 'undefined' ? 50 : data.skill,
                'min': 1,
                'max': 99999
            });
            this.focus = new Attribute();
            this.focus.init({
                'id': 'foc',
                'owner': this,
                'value': typeof data.focus == 'undefined' ? 50 : data.focus,
                'min': 1,
                'max': 99999
            });
            this.power = new Attribute();
            this.power.init({
                'id': 'pow',
                'owner': this,
                'value': typeof data.power == 'undefined' ? 50 : data.power,
                'min': 1,
                'max': 99999
            });
            //OTHER
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
