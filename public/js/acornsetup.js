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

            Acorn.Net.on(Enums.CHECKNAME, function (data) {
                if (data[Enums.BOOL]){
                    NewChar.nameAvailable = true;
                }else{
                    NewChar.nameAvailable = false;
                }
                NewChar.waitingForNameAvailability = false;
            });

            Acorn.Net.on(Enums.CREATECHARERROR, function (data) {
                alert(data[Enums.CREATECHARERROR])
            });

            Acorn.Net.on(Enums.ADDCHARACTER, function (data) {
                console.log(data);
                Player.addCharacter(data);
                Acorn.changeState('mainmenu');
            });
            
            Acorn.Net.on(Enums.NEWMAP, function (data) {
                console.log(data);
                Game.map = new GameMap();
                Game.map.init(data.mapData);
                Game.ready = true;
            });

            Acorn.Net.on('changeMap', function (data) {
                console.log('newMap!!');
                console.log(data);
                Game.newMapData = data;
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

            Acorn.addState({
                stateId: 'battle',
                init: function(){
                    document.body.style.cursor = 'default';
                    Battle.init();
                },
                update: function(dt){
                    Battle.update(dt);
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
            });
            Acorn.Input.onMouseUp(function(e) {
                Acorn.Input.mouseDown = false;
            });

            Acorn.Input.onScroll(function(e) {

            });

            Acorn.Input.onMouseMove(function(e) {

            });

            Acorn.Input.onTouchEvent(function(e) {

            });
        }
        
    }
    window.AcornSetup = AcornSetup;
})(window);