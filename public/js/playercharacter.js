(function(window) {

    PlayerCharacter = function(){
        var unit = Unit();
        //full stats
        unit.ac = null;
        unit.agility = null;
        unit.arcaneRes = null;
        unit.charisma = null;
        unit.dexterity = null;
        unit.diseaseRes = null;
        unit.earthRes = null;
        unit.fireRes = null;
        unit.frostRes = null;
        unit.holyres = null;
        unit.luck = null;
        unit.currentExp = null;
        unit.poisonRes = null;
        unit.perception = null;
        unit.rangedPower = null;
        unit.meleePower = null;
        unit.spellPower = null;
        unit.healingPower = null;
        unit.shadowRes = null;
        unit.shockRes = null;
        unit.strength = null;
        unit.stamina = null;
        unit.windRes = null;
        unit.wisdom = null;
        unit.carryWeight = null;
        unit.intelligence = null;
        unit.jumpSpeed = null;
        unit.jumpTime = null;
        unit.level = null;
        
        unit.init = function(data){
            console.log("initializing!")
            this._init(data);
            
            this.class = data[Enums.CLASS];
            this.race = data[Enums.RACE];
            this.slot = data[Enums.SLOT];

        };
        unit.update = function(dt){
            this._update(dt);
        };
        unit.updateStats = function(data){
            this._updateStats(data);
        };
        return unit;
    }
    window.PlayerCharacter = PlayerCharacter;
})(window);