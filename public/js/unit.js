
(function(window) {

    var Unit = function(){
        return {
            id: null,
            name: null,
            currentHealth: null,
            maxHealth: null,
            level: null,
            race: null,
            class: null,
            sprite: new PIXI.Container(),

            _init: function(data){
                this.id = data[Enums.ID];
                this.name = data[Enums.NAME];
                this.currentHealth = data[Enums.CURRENTHEALTH];
                this.maxHealth = data[Enums.MAXHEALTH];
                this.level = data[Enums.LEVEL];
            }
        }
    };
    window.Unit = Unit;
})(window);