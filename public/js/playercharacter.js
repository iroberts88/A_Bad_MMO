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
                this[i] = data[i];
            }
        };
        return unit;
    }
    window.PlayerCharacter = PlayerCharacter;
})(window);