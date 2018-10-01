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

        enums: {
            //client and database enums

            //calls
            DISCONNECT: 'disconnect',
            CHECKNAME: 'checkName',
            CLIENTCOMMAND: 'clientCommand',
            COMMAND: 'command',
            CONNINFO: 'connInfo',
            CREATECHAR: 'creatChar',
            CREATECHARERROR: 'createCharError',
            LOGINATTEMPT: 'loginAttempt',
            LOGOUT: 'logout',
            MAPDATA: 'mapData',
            PLAYERUPDATE: 'playerUpdate',
            SETLOGINERRORTEXT: 'setLoginErrorText',


            //var names
            ATTRIBUTES: 'attributes',
            AVAILABLECLASSES: 'availableClasses',
            BOOL: 'bool',
            CLASSES: 'classes',
            CLASS: 'class',
            CLASSID: 'classid',
            DESCRIPTION: 'description',
            ID: 'id',
            NAME: 'name',
            RACES: 'races',
            RACE: 'race',
            RACEID: 'raceid',
            SLOT: 'slot',
            TEXT: 'text'
        },

        net: function() {
            Acorn.Net.on(this.enums.CONNINFO, function (data) {
                console.log('Connected to server: Info Received');
                console.log(data);
                mainObj.id = data[AcornSetup.enums.ID];
                NewChar.raceInfo = data[AcornSetup.enums.RACES];
                NewChar.classInfo = data[AcornSetup.enums.CLASSES];
                Acorn.Net.ready = true;
                checkReady();
            });

            Acorn.Net.on(this.enums.CHECKNAME, function (data) {
                if (data[AcornSetup.enums.BOOL]){
                    NewChar.nameAvailable = true;
                }else{
                    NewChar.nameAvailable = false;
                }
                NewChar.waitingForNameAvailability = false;
            });

            Acorn.Net.on(this.enums.CREATECHARERROR, function (data) {
                alert(data[AcornSetup.enums.CREATECHARERROR])
            });
            
            Acorn.Net.on('startGame', function (data) {

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
            Acorn.Net.on('setLoginErrorText', function (data) {
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
            Acorn.Net.on('loggedIn', function (data) {
                Player.init(data);
                document.body.removeChild(MainMenu.mainPanel);
                MainMenu.showCharacterSelection();
            });

            Acorn.Net.on('logout', function (data) {
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
                stateId: 'ingame',
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