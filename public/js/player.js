
(function(window) {
    Player = {
    	userData: null,
    	characters: null,
        currentCharacter: null,
        currentTarget: null,
        mapLoc: null,
        clickMove: false,
        clickPos: null,

        rangedAttackOn: false,
        meleeAttackOn: false,

        rangeMsgDelay: 1.5,
        rangeMsgTicker: 0,
        
        init: function(data){
        	this.userData = data;
            this.characters = {};
            if (typeof data[Enums.CHARACTERS] != 'undefined'){
                for (var i in data[Enums.CHARACTERS]){
                    this.addCharacter(data[Enums.CHARACTERS][i]);
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
            if (this.rangeMsgTicker < this.rangeMsgDelay){
                this.rangeMsgTicker += dt;
            }else if ((this.meleeAttackOn || this.rangedAttackOn) && this.currentTarget){
                //add msg depending on range!
                var range = [0,0]
                if (this.meleeAttackOn){
                    range = [-Infinity,50];
                }else{
                    var w = Game.characterWindow.itemSlots['ranged'].item;
                    if (!w){
                        var d = {};
                        d[Enums.MESSAGETYPE] = 'rangeMsg';
                        d[Enums.TEXT] = 'You must equip a ranged weapon!';
                        Game.addMessage(d);
                        this.rangeMsgTicker = 0;
                        return null;
                    }
                    range = w.range;
                }
                var hb1 = this.currentCharacter.hb.pos;
                var hb2 = this.currentTarget.hb.pos;
                //get proper range
                var distance = Math.sqrt(Math.pow(hb1.x-hb2.x,2)+Math.pow(hb1.y-hb2.y,2))
                distance -= this.currentTarget.sprite.width/2;
                var d = {};
                d[Enums.MESSAGETYPE] = 'rangeMsg';
                if (distance < range[0]){
                    d[Enums.TEXT] = 'Target is too close!!';
                    Game.addMessage(d)
                }else if (distance > range[1]){
                    d[Enums.TEXT] = 'Target is too far away!!';
                    Game.addMessage(d)
                }else{
                    return;
                }
                this.rangeMsgTicker = 0;
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
                if (Acorn.Input.buttons[2] != true && 
                    (Math.abs(this.currentCharacter.sprite.position.x - this.clickPos[0]) <= Math.abs(this.currentCharacter.moveVector.x*this.currentCharacter.speed*dt) ||
                    Math.abs(this.currentCharacter.sprite.position.y - this.clickPos[1]) <= Math.abs(this.currentCharacter.moveVector.y*this.currentCharacter.speed*dt))){
                    //reached destination
                    this.currentCharacter.moveVector.x = 0;
                    this.currentCharacter.moveVector.y = 0;
                    this.clickMove = false;
                    Player.sendMove();
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
        },

        setTarget: function(unit,updateServer = true){
            Game.targetStatus.unit = unit;
            Game.targetStatus.name = 'Target: ' + unit.name;
            if (!this.currentTarget){
                Game.targetStatus.activate();
            }
            this.currentTarget = unit;
            this.currentCharacter.target = unit;
            if (this.currentTarget.target){
                Game.targetTargetStatus.unit = unit.target;
                Game.targetTargetStatus.name = 'Target: ' + unit.target.name;
                Game.targetTargetStatus.activate();
            }
            Game.targetStatus.resize(Game.targetStatus.width,Game.targetStatus.height);
            Game.targetTargetStatus.resize(Game.targetTargetStatus.width,Game.targetTargetStatus.height);
            //send SETTARGET command
            if (updateServer){
                var data = {};
                data[Enums.COMMAND] = Enums.SETTARGET;
                data[Enums.UNIT] = unit.id;
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
            }
        },

        clearTarget: function(updateServer = true){
            this.currentTarget = null;
            this.currentCharacter.target = null;
            Game.targetStatus.deActivate();
            Game.targetTargetStatus.deActivate();

            if (updateServer){
                var data = {};
                data[Enums.COMMAND] = Enums.CLEARTARGET;
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
            }
            if (this.rangedAttackOn){
                this.rangedAttackOn = false;
            }
            if (this.meleeAttackOn){
                this.meleeAttackOn = false;
            }
        },

        toggleRangedAttack: function(){
            var d = {};
            d[Enums.MESSAGETYPE] = 'combatMsg';
            d[Enums.TEXT] = 'Ranged attack mode *ON*';
            if (this.rangedAttackOn){
                this.rangedAttackOn = false;
                d[Enums.TEXT] = 'Ranged attack mode *OFF*';
                Game.addMessage(d);
            }else if (this.meleeAttackOn){
                this.meleeAttackOn = false;
                this.rangedAttackOn = true;
                Game.addMessage(d);
            }else{
                this.rangedAttackOn = true;
                Game.addMessage(d);
            }
        },
        toggleMeleeAttack: function(){
            var d = {};
            d[Enums.MESSAGETYPE] = 'combatMsg';
            d[Enums.TEXT] = 'Melee attack mode *ON*';
            if (this.meleeAttackOn){
                this.meleeAttackOn = false;
                d[Enums.TEXT] = 'Melee attack mode *OFF*';
                Game.addMessage(d);
            }else if (this.rangedAttackOn){
                this.rangedAttackOn = false;
                this.meleeAttackOn = true;
                Game.addMessage(d);
            }else{
                this.meleeAttackOn = true;
                Game.addMessage(d);
            }
        },
        sendPlayerUpdate(data){
            Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
        }
    }
    window.Player = Player;
})(window);
