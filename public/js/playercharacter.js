(function(window) {

    var PlayerCharacter = function(){};

    PlayerCharacter.prototype.init = function(data){
        for (var i in data){
            this[i] = data[i];
        }
    };

    PlayerCharacter.prototype.updateStats = function(data){
        for (var i in data){
            this[i] = data[i];
        }
    };

    window.PlayerCharacter = PlayerCharacter;
})(window);