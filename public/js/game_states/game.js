
(function(window) {
    Game = {
        UI_OFFSETSCALE: 0.8,
        SCREEN_CHANGE_TIME: 0.5,
        BORDER_SCALE: 3,

        map: null,

        ready: false,

        pcs: {},
        npcs: {},

        screenChange: false,
        screenTicker: 0,

        mainChat: null,

        uiUpdateList: null,

        init: function() {
            Graphics.app.renderer.backgroundColor = 0x000000;
            this.uiUpdateList = [];
            this.mainChat = ChatWindow();
            this.mainChat.init({
                id: 'mainChat',
                name: 'Main Chat',
                width: Graphics.width/4.5,
                height: Graphics.height/5,
                main: true,
                maxWidth: 900,
                maxHeight: 500,
                minHeight: 100,
                minWidth: 180,
                nameBarSize: [Graphics.width/4.5,25]
            });
            this.mainChat.activate();


            this.playerStatus = UnitStatusBar();
            this.playerStatus.init({
                id: 'playerStatus',
                unit: Player.currentCharacter,
                width: 160,
                height: 80,
                x: 10,
                y: 10,
                maxWidth: 400,
                maxHeight: 200,
                minHeight: 80,
                minWidth: 100,
                nameBarSize: [400,18]
            });
            this.playerStatus.activate();

            this.characterWindow = CharWindow();
            this.characterWindow.init({
                id: 'characterWindow',
                name: Player.currentCharacter.name,
                width: 475,
                height: 650,
                x: 100,
                y: 100,
                maxWidth: 475,
                maxHeight: 650,
                minHeight: 475,
                minWidth: 650,
                nameBarSize: [600,25]
            });
            this.characterWindow.activate();

            this.uiUpdateList.push(this.playerStatus);
            this.setUILock(true);
        },

        update: function(deltaTime){
            if (!this.ready){return;}
            if (this.screenChange){
                this.updateScreenChange(deltaTime);
                return;
            }
            //get movement keys!!
            var cmX = Player.currentCharacter.moveVector.x;
            var cmY = Player.currentCharacter.moveVector.y;
            Player.setMove(deltaTime);
            if (cmX != Player.currentCharacter.moveVector.x || cmY != Player.currentCharacter.moveVector.y){
                Player.sendMove();
            }
            //update the player and move the world viewport
            Player.update(deltaTime);
            Graphics.world.position.x = Math.round((Graphics.width/2) - Player.currentCharacter.sprite.position.x*Graphics.world.scale.x);
            Graphics.world.position.y = Math.round((Graphics.height/2) - Player.currentCharacter.sprite.position.y*Graphics.world.scale.y);
            //update all player characters
            PCS.update(deltaTime);
            //update ui list
            for (var i = 0; i < this.uiUpdateList.length;i++){
                this.uiUpdateList[i].update(deltaTime);
            }
            //check Keys
            if (Acorn.Input.isPressed(Acorn.Input.Key.COMMAND)){
                this.mainChat.textBox.text = '';
                this.mainChat.textBox.activate();
                this.mainChat.textBox.addToText('/');
                Acorn.Input.setValue(Acorn.Input.Key.COMMAND,false)
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.DEVCOMMAND)){
                this.mainChat.textBox.text = '';
                this.mainChat.textBox.activate();
                this.mainChat.textBox.addToText(':');
                Acorn.Input.setValue(Acorn.Input.Key.DEVCOMMAND,false)
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.ENTER)){
                this.mainChat.textBox.activate();
                Acorn.Input.setValue(Acorn.Input.Key.ENTER,false)
            }
        },

        updateScreenChange: function(deltaTime){
            this.screenTicker += deltaTime;
            if (this.screenTicker > this.SCREEN_CHANGE_TIME && this.newMapData && typeof this.mapsCache[this.newMapData.map] != 'undefined'){
                this.setNewMap(this.newMapData.map);
                Graphics.uiPrimitives2.clear();
            }else{
                Graphics.uiPrimitives2.lineStyle(1,0x000000,0.25);
                Graphics.uiPrimitives2.beginFill(0x000000,0.25);
                Graphics.uiPrimitives2.drawRect(0,0,Graphics.width,Graphics.height);
                Graphics.uiPrimitives2.endFill();
            }
        },

        setUILock: function(b){
            this.mainChat.setLock(b);
            this.playerStatus.setLock(b);
        },

        setNewMap: function(name){
            try{
                var myObj = this.mapsCache[name];
                Graphics.worldContainer.removeChildren();
                Graphics.worldContainer2.removeChildren();
                Graphics.charContainer1.removeChildren();
                Graphics.charContainer2.removeChildren();
                Graphics.uiPrimitives2.clear();
                Game.map = new GameMap();
                Game.map.init(myObj.mapData);
                Player.character.tile = Game.newMapData.tile;
                Player.character.sector = Game.newMapData.sector;
                Player.character.map = Game.newMapData.map;
                Game.resetPos();
                Game.screenChange = false;
                Game.screenTicker = 0;
                Graphics.uiPrimitives2.clear();
                for (var i = 0; i < Game.newMapData.players.length;i++){
                    if (Game.newMapData.players[i].id != mainObj.id){
                        var pc = new PlayerCharacter();
                        pc.init(Game.newMapData.players[i]);
                        Game.pcs[Game.newMapData.players[i].id] = pc;
                    }
                }
                Game.newMapData = null;
                Game.requestMade = false;
            }catch(e){
                console.log(e);
            }
        },

        rightClick: function(x,y){
            Player.clickMove = true;
            Player.clickPos = [x,y];
            Player.currentCharacter.moveVector.x = x - Player.currentCharacter.sprite.position.x;
            Player.currentCharacter.moveVector.y = y - Player.currentCharacter.sprite.position.y;
            Player.currentCharacter.moveVector.normalize();
        },

        addMessage: function(data){
            switch(data[Enums.MESSAGETYPE]){
                case Enums.SAY:
                    if (data[Enums.ID] == Player.currentCharacter.id){
                        this.mainChat.addMessage('You say: ' + data[Enums.TEXT], 0xFFFFFF);
                    }else{
                        this.mainChat.addMessage(data[Enums.NAME] + ' says: ' + data[Enums.TEXT], 0xFFFFFF);
                    }
                    break;
                case Enums.SHOUT:
                    if (data[Enums.ID] == Player.currentCharacter.id){
                        this.mainChat.addMessage('You shout: ' + data[Enums.TEXT] + '!', 0xFF0000);
                    }else{
                        this.mainChat.addMessage(data[Enums.NAME] + ' shouts: ' + data[Enums.TEXT] + '!', 0xFF0000);
                    }
                    break;
                case Enums.WHISPER:
                    if (data[Enums.ID] == Player.currentCharacter.id){
                        this.mainChat.addMessage('You whisper: ' + data[Enums.TEXT], 0xff99f8);
                    }else{
                        this.mainChat.addMessage(data[Enums.NAME] + ' whispers: ' + data[Enums.TEXT], 0xff99f8);
                    }
                    break;
                case Enums.ZONE:
                    if (data[Enums.ID] == Player.currentCharacter.id){
                        this.mainChat.addMessage('You say to the zone: ' + data[Enums.TEXT], 0x81ff7f);
                    }else{
                        this.mainChat.addMessage(data[Enums.NAME] + ' says to the zone: ' + data[Enums.TEXT], 0x81ff7f);
                    }
                    break;

            }
        },

        checkClientCommand: function(txt){
            switch(txt){
                case '/uilock':
                    Settings.toggleUILock();
                    if (Settings.uilocked){
                        this.mainChat.addMessage('*UI LOCKED*', 0xFFFF00);
                        document.body.style.cursor = "default";
                    }else{
                        this.mainChat.addMessage('*UI UNLOCKED*', 0xFFFF00);
                    }
                    return true;
                case '/help':
                    this.mainChat.addMessage('TODO: ADD HELP MSG!', 0xFFFF00);
                    return true;
            }
            return false;
        }   

    }
    window.Game = Game;
})(window);
