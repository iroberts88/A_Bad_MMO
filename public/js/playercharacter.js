(function(window) {

    PlayerCharacter = function(){
        var unit = Unit();
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
            for (var i in data){
                switch(i){
                    case Enums.CURRENTENERGY:
                        this.currentEnergy = data[i];
                        break;
                    case Enums.MAXENERGY:
                        this.maxEnergy = data[i];
                        break;
                }
            }
        };
        return unit;
    }
    window.PlayerCharacter = PlayerCharacter;
})(window);