(function(window) {

    AcornSetup = {
        
        style1: {
            font: '18px Lato',
            fill: Graphics.pallette.color1,
            align: 'left'
        },
        style2: {
            font: '18px Lato',
            fill: Graphics.pallette.color1,
            align: 'left',
            wordWrap: true,
            wordWrapWidth: 425
        },

        style3: {
            font: '18px Permanent Marker',
            fill: Graphics.pallette.color1,
            align: 'left'
        },
        style4: {
            font: '18px Lato',
            fill: 0xFFFFFF,
            align: 'left'
        },

        net: function() {
            Acorn.Net.on(Enums.CONNINFO, function (data) {
                console.log('Connected to server: Info Received');
                console.log(data);
                mainObj.id = data[Enums.ID];
                NewChar.raceInfo = data[Enums.RACES];
                NewChar.classInfo = data[Enums.CLASSES];
                Acorn.Net.ready = true;
                checkReady();
            });


            Acorn.Net.on(Enums.ADDCHARACTER, function (data) {
                console.log(data);
                Player.addCharacter(data);
                Acorn.changeState('mainmenu');
            });

            Acorn.Net.on(Enums.CHECKNAME, function (data) {
                if (data[Enums.BOOL]){
                    NewChar.nameAvailable = true;
                }else{
                    NewChar.nameAvailable = false;
                }
                NewChar.waitingForNameAvailability = false;
            });

            Acorn.Net.on(Enums.CREATECHARERROR, function (data) {
                alert(data[Enums.CREATECHARERROR]);
            });

            Acorn.Net.on(Enums.EQUIPITEM, function (data) {
                console.log(data);
                //add an item to an EMPTY slot and remove the item from bags/currsor
                var slot = Game.characterWindow.itemSlots[data[Enums.SLOT]];
                if (!Game.cursorItem){
                    var item = Game.bagWindow.items[data[Enums.ITEM]];
                }else if(Game.cursorItem.id == data[Enums.ITEM]){
                    var item = Game.cursorItem;
                }

                if (!slot.item){
                    slot.item = item;
                }
                Game.cursorItem = null;
                var pos = [item.position[0],item.position[1]];
                Game.bagWindow.removeItem(item);
                item.position = data[Enums.SLOT];
                item.setOnSlot();
                if (typeof data[Enums.BAG1] != 'undefined'){
                    Game.bagWindow.bag1 = data[Enums.BAG1];
                }
                if (typeof data[Enums.BAG2] != 'undefined'){
                    Game.bagWindow.bag2 = data[Enums.BAG2];
                }
                if (typeof data[Enums.BAG3] != 'undefined'){
                    Game.bagWindow.bag3 = data[Enums.BAG3];
                }
                if (typeof data[Enums.BAG4] != 'undefined'){
                    Game.bagWindow.bag4 = data[Enums.BAG4];
                }
                Game.bagWindow.draw();
            });

            Acorn.Net.on(Enums.UNEQUIPITEM, function (data) {
                console.log(data);
                //add an item to an EMPTY slot and remove the item from bags/currsor
                var slot = Game.characterWindow.itemSlots[data[Enums.SLOT]];
                slot.item = null;
                if (typeof data[Enums.BAG1] != 'undefined'){
                    Game.bagWindow.bag1 = data[Enums.BAG1];
                }
                if (typeof data[Enums.BAG2] != 'undefined'){
                    Game.bagWindow.bag2 = data[Enums.BAG2];
                }
                if (typeof data[Enums.BAG3] != 'undefined'){
                    Game.bagWindow.bag3 = data[Enums.BAG3];
                }
                if (typeof data[Enums.BAG4] != 'undefined'){
                    Game.bagWindow.bag4 = data[Enums.BAG4];
                }
                Game.bagWindow.gfx.clear();
                Game.bagWindow.draw();
            });
            
            Acorn.Net.on(Enums.GETINVENTORY, function (data) {
                console.log(data);
                Game.initBagWindow(data);
            });

            Acorn.Net.on(Enums.NEWMAP, function (data) {
                console.log(data);
                Game.map = new GameMap();
                Game.map.init(data[Enums.MAPDATA]);
                PCS.init(data);
                NPCS.init(data);

                for (var i = 0; i < data[Enums.PLAYERS].length;i++){
                    if (data[Enums.PLAYERS][i][Enums.ID] == Player.currentCharacter.id){
                        continue;
                    }
                    PCS.addPC(data[Enums.PLAYERS][i]);
                }
                for (var i = 0; i < data[Enums.NPCS].length;i++){
                    NPCS.addNPC(data[Enums.NPCS][i]);
                }
                Game.ready = true;
                Graphics.unitContainer.addChild(Player.currentCharacter.sprite);
                Graphics.unitContainer2.addChild(Player.currentCharacter.sprite2);
                Graphics.unitContainer2.addChild(Player.currentCharacter.spriteMask);
                Graphics.unitContainer2.addChild(Player.currentCharacter.nameTag);
            });

            Acorn.Net.on(Enums.ADDPC, function (data) {
                console.log(data);
                if (data[Enums.ID] != Player.currentCharacter.id){
                    PCS.addPC(data);
                }
            });

            Acorn.Net.on(Enums.REMOVEPC, function (data) {
                console.log(data);
                if (data[Enums.ID] != Player.currentCharacter.id){
                    PCS.removePC(data);
                }
            });
            Acorn.Net.on(Enums.ADDNPC, function (data) {
                console.log(data);
                NPCS.addNPC(data)
            });

            Acorn.Net.on(Enums.REMOVENPC, function (data) {
                console.log(data);
                NPCS.removeNPC(data);
            });

            Acorn.Net.on(Enums.ADDITEM, function (data) {
                Game.bagWindow.addNewItem(data);
            });

            Acorn.Net.on(Enums.SETITEMQUANTITY, function (data) {
                if (typeof Game.bagWindow.items[data[Enums.ID]] != 'undefined'){
                    Game.bagWindow.items[data[Enums.ID]].setQuantity(data[Enums.QUANTITY]);
                };
            });

            Acorn.Net.on(Enums.REMOVEITEM, function (data) {
                console.log(data);
            });

            Acorn.Net.on(Enums.POSUPDATE, function (data) {
                if (data[Enums.ID] != Player.currentCharacter.id){
                    Game.allUnits[data[Enums.ID]].moveVector.x = data[Enums.MOVEVECTOR][0];
                    Game.allUnits[data[Enums.ID]].moveVector.y = data[Enums.MOVEVECTOR][1];
                    Game.allUnits[data[Enums.ID]].hb.pos.x = data[Enums.POSITION][0];
                    Game.allUnits[data[Enums.ID]].hb.pos.y = data[Enums.POSITION][1];
                }
            });

            Acorn.Net.on(Enums.STICK, function (data) {
                if (data[Enums.ID] != Player.currentCharacter.id){
                    Game.allUnits[data[Enums.ID]].stickToTarget = data[Enums.BOOL];
                }
            });

            Acorn.Net.on(Enums.SETTARGET, function (data) {
                if (data[Enums.UNIT] == Player.currentCharacter.id){
                    //force target change
                    Player.setTarget(Game.allUnits[data[Enums.TARGET]],false);
                }
                if (typeof Game.allUnits[data[Enums.UNIT]] == 'undefined'){
                    //the unit's target is not visible to you!
                    //TODO deal with this.....
                }else if (Game.allUnits[data[Enums.UNIT]]){
                    Game.allUnits[data[Enums.UNIT]].setTarget(Game.allUnits[data[Enums.TARGET]]);
                }
            });
            Acorn.Net.on(Enums.CLEARTARGET, function (data) {
                if (data[Enums.UNIT] == Player.currentCharacter.id){
                    //force target clear
                    Player.clearTarget(false);
                }
                Game.allUnits[data[Enums.UNIT]].clearTarget();
            });

            Acorn.Net.on(Enums.MESSAGE, function (data) {
                Game.addMessage(data);
            });

            Acorn.Net.on(Enums.DEALDAMAGE, function (data) {
                //you have dealt damage to something..
                var d = {};
                d[Enums.MESSAGETYPE] = 'combatHit';
                d[Enums.TEXT] = 'You HIT ' + Game.allUnits[data[Enums.UNIT]].name + ' for ' + data[Enums.VALUE] + ' ' + Enums.damageTypeEnums[data[Enums.TYPE]] + ' damage!';
                Game.addMessage(d);
                CombatText.addText({
                    text: data[Enums.VALUE],
                    color: 0xFFFFFF,
                    unit: Game.allUnits[data[Enums.UNIT]]
                });
            });
            Acorn.Net.on(Enums.DEALTDAMAGE, function (data) {
                //you have recieved damage
                var d = {};
                d[Enums.MESSAGETYPE] = 'combatHitTaken';
                d[Enums.TEXT] = data[Enums.UNIT] + ' hits YOU for ' + data[Enums.VALUE] + ' ' + Enums.damageTypeEnums[data[Enums.TYPE]] + ' damage!';
                Game.addMessage(d);
                Player.currentCharacter.setStat(Enums.CURRENTHEALTH,data[Enums.STAT]);
                CombatText.addText({
                    text: data[Enums.VALUE],
                    color: 0xFF0000,
                    unit: Player.currentCharacter
                });
            });
            Acorn.Net.on(Enums.MISSED, function (data) {
                //you have been missed

                //you have missed your target
                var d = {};
                d[Enums.MESSAGETYPE] = 'combatMiss';
                d[Enums.TEXT] = data[Enums.BOOL] ? data[Enums.UNIT] + ' tried to hit you, but missed!' :'You MISSED ' + Game.allUnits[data[Enums.UNIT]].name + '!';
                Game.addMessage(d);
            });

            Acorn.Net.on(Enums.SETUNITSTAT, function (data) {
                console.log(data);
                if (!Player.currentCharacter){return;}
                if (data[Enums.UNIT] == Player.currentCharacter.id){
                    Player.currentCharacter.setStat(data[Enums.STAT],data[Enums.VALUE]);
                    if (typeof Game.characterWindow.statDisplays[data[Enums.STAT]] != 'undefined'){
                        Game.characterWindow.statDisplays[data[Enums.STAT]].text = data[Enums.VALUE];
                        var fill = 0xFFFFFF;
                        if (data[Enums.MOD] > 0){
                            fill = 0x80f442;
                        }else if (data[Enums.MOD] < 0){
                            fill = 0xf75a4f;
                        }
                        Game.characterWindow.statDisplays[data[Enums.STAT]].style.fill = fill;
                    }
                }else{
                    Game.allUnits[data[Enums.UNIT]].setStat(data[Enums.STAT],data[Enums.VALUE]);
                }
            });

            Acorn.Net.on('mapData', function (data) {
                console.log('received map data');
                console.log(data);
                Game.mapsCache[data.name] = data.zoneData;
            });

            //other
            Acorn.Net.on('debug', function (data) {
                console.log('sever ERROR debug');
                console.log(data);
            });


            Acorn.Net.on('ping', function (data) {
                Settings.stats.pingReturn();
            });

            //Login screen stuff
            Acorn.Net.on(Enums.SETLOGINERRORTEXT, function (data) {
                var s = 'Login Error';
                switch(data.text){
                    case 'userexists':
                        s = 'Username is already in use. Please try another!';
                        break;
                    case 'snlength':
                        s = 'Username length must be between 3 and 16 characters';
                        break;
                    case 'plength':
                        s = 'Password length must be at least 6 characters'
                        break;
                    case 'wrongpass':
                        s = 'Incorrect username or password';
                        break;
                }
                MainMenu.setLoginErrorText(s);
            });
            Acorn.Net.on(Enums.LOGGEDIN, function (data) {
                console.log(data);
                Player.init(data);
                document.body.removeChild(MainMenu.mainPanel);
                MainMenu.showCharacterSelection();
            });

            Acorn.Net.on(Enums.LOGOUT, function (data) {
                console.log(data);
                Player.userData = null;
                Acorn.changeState('mainmenu');
            });
            

        },

        states: function(){
            //Set up all states
            //-----------------------------------------------------------------------------------------------|
            //                              Game States (Acorn.states)                                       |
            //-----------------------------------------------------------------------------------------------|

            Acorn.addState({
                stateId: 'mainmenu',
                init: function(){
                    document.body.style.cursor = 'default';
                    MainMenu.init();
                },
                update: function(dt){
                    MainMenu.update(dt);
                }
            });

            Acorn.addState({
                stateId: 'newchar',
                init: function(){
                    document.body.style.cursor = 'default';
                    NewChar.init();
                },
                update: function(dt){
                    NewChar.update(dt);
                }
            });

            Acorn.addState({
                stateId: 'game',
                init: function(){
                    document.body.style.cursor = 'default';
                    Game.init();
                },
                update: function(dt){
                    Game.update(dt);
                }
            });
            
        },

        input: function(){
            Acorn.Input.onMouseClick(function(e) {
                Acorn.Input.mouseDown = true;
                if (Graphics.currentTextBox){
                    if (!Graphics.textBoxes[Graphics.currentTextBox].pointerOver){
                        Graphics.textBoxes[Graphics.currentTextBox].deactivate();
                    }
                }
                if (e.button == 2 && Game.ready){
                    if (Game.cursorItem){
                        if (Game.cursorItemFlipped){
                            Game.cursorItemFlipped = false;
                            Game.cursorItem.sprite.rotation = 0;
                        }else{
                            Game.cursorItemFlipped = true;
                            Game.cursorItem.sprite.rotation = -1.5708;
                        }
                    }else if (!Game.hoverItem){
                        Game.rightClick(e.clientX/Graphics.actualRatio[0] - Graphics.world.position.x,e.clientY/Graphics.actualRatio[1] - Graphics.world.position.y);
                        Player.sendMove();
                    }
                }
            });
            Acorn.Input.onMouseUp(function(e) {
                Acorn.Input.mouseDown = false;
                if (e.button == 2 && Game.ready && Game.cursorItem == null && Game.hoverItem == null){
                    Game.rightClick(e.clientX/Graphics.actualRatio[0] - Graphics.world.position.x,e.clientY/Graphics.actualRatio[1] - Graphics.world.position.y);
                    Player.sendMove();
                }
            });

            Acorn.Input.onScroll(function(e) {

            });

            Acorn.Input.onMouseMove(function(e) {
                if (Acorn.Input.buttons[2] && Player.clickMove){
                    Game.rightClick(e.clientX/Graphics.actualRatio[0] - Graphics.world.position.x,e.clientY/Graphics.actualRatio[1] - Graphics.world.position.y);
                    Player.sendMove();
                }
            });

            Acorn.Input.onTouchEvent(function(e) {

            });
        }
        
    }
    window.AcornSetup = AcornSetup;
})(window);