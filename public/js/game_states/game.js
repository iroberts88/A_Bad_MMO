
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

        init: function() {
            Graphics.app.renderer.backgroundColor = 0x000000;
            Graphics.worldContainer2.addChild(Player.currentCharacter.sprite);
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
                //send new moveVector?!
            }
            Player.currentCharacter.update(deltaTime);

            Graphics.world.position.x = Math.round((Graphics.width/2) - Player.currentCharacter.sprite.position.x);
            Graphics.world.position.y = Math.round((Graphics.height/2) - Player.currentCharacter.sprite.position.y);
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
        }

    }
    window.Game = Game;
})(window);
