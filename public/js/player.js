
(function(window) {
    Player = {
    	userData: null,
    	characters: null,
        currentCharacter: null,
        mapLoc: null,
        clickMove: false,
        clickPos: null,
        
        init: function(data){
        	this.userData = data;
            this.characters = {};
            if (typeof data.characters != 'undefined'){
                for (var i in data.characters){
                    this.addCharacter(data.characters[i]);
                }
            }
            this.mapLoc = new SAT.Vector(0,0);
        },

        update: function(dt){
            var currentSector = Game.map.getSector(this.currentCharacter.hb.pos.x,this.currentCharacter.hb.pos.y);
            this.currentCharacter.update(dt);
            var newSector = Game.map.getSector(this.currentCharacter.hb.pos.x,this.currentCharacter.hb.pos.y);
            if (currentSector != newSector){
                Game.map.updateVisibleSectors(currentSector,newSector);
            }

        },

        addCharacter: function(data){
            var char = PlayerCharacter();
            char.init(data);
            this.characters[char.slot] = char;
        },

        setMove: function(dt){
            //get movement keys!!
            if (Acorn.Input.isPressed(Acorn.Input.Key.UP) ||
            Acorn.Input.isPressed(Acorn.Input.Key.DOWN) ||
            Acorn.Input.isPressed(Acorn.Input.Key.LEFT) ||
            Acorn.Input.isPressed(Acorn.Input.Key.RIGHT) ){
                this.clickMove = false;
                this.currentCharacter.moveVector.x = 0;
                this.currentCharacter.moveVector.y = 0;
                if (Acorn.Input.isPressed(Acorn.Input.Key.UP)){
                    this.currentCharacter.moveVector.y -= 1;
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.DOWN)){
                    this.currentCharacter.moveVector.y += 1;
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.LEFT)){
                    this.currentCharacter.moveVector.x -= 1;
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.RIGHT)){
                    this.currentCharacter.moveVector.x += 1;
                }
            }else if (this.clickMove){
                if (Acorn.Input.buttons[2] != true && Math.abs(this.currentCharacter.sprite.position.x - this.clickPos[0]) <= Math.abs(this.currentCharacter.moveVector.x*this.currentCharacter.speed*dt)){
                    //reached destination
                    this.currentCharacter.moveVector.x = 0;
                    this.currentCharacter.moveVector.y = 0;
                    this.clickMove = false;
                    this.currentCharacter.sprite.position.x = this.clickPos[0];
                    this.currentCharacter.sprite.position.y = this.clickPos[1];
                }
            }else{
                this.currentCharacter.moveVector.x = 0;
                this.currentCharacter.moveVector.y = 0;
            }
            this.currentCharacter.moveVector.normalize();
        },
        sendMove: function(){
            var data = {};
            data[Enums.COMMAND] = Enums.MOVE;
            data[Enums.POSITION] = [this.currentCharacter.sprite.position.x,this.currentCharacter.sprite.position.y];
            data[Enums.MOVEVECTOR] = [this.currentCharacter.moveVector.x,this.currentCharacter.moveVector.y];
            Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
        }
    }
    window.Player = Player;
})(window);
