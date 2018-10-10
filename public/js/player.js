
(function(window) {
    Player = {
    	userData: null,
    	characters: null,
        
        init: function(data){
        	this.userData = data;
            this.characters = {};
        },

        addCharacter: function(data){
            var char = PlayerCharacter();
            char.init(data);
            this.characters[char.slot] = char;
        }
    }
    window.Player = Player;
})(window);
