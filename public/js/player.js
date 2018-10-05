
(function(window) {
    Player = {
    	userData: null,
    	characters: null,
        
        init: function(data){
        	this.userData = data;
            this.characters = {};
        },

        addCharacter: function(data){
            var char = new PlayerCharacter();
            char.init(data);
            this.characters[char[AcornSetup.enums.SLOT]] = char;
        }
        
    }
    window.Player = Player;
})(window);
