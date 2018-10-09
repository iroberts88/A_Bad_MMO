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

            //DB
            //need to match the DB values
            MAPDATA: 'mapData',
            CLASSID: 'classid',
            DESCRIPTION: 'description',
            NAME: 'name',
            ATTRIBUTES: 'attributes',
            AVAILABLECLASSES: 'availableClasses',
            RACEID: 'raceid',
            RESOURCE: 'resource',
            SECTORARRAY: 'sectorArray',
            TILES: 'tiles',
            TRIGGERS: 'triggers',
            MAPID: 'mapid',
            OPEN: 'open',
            OVERLAYRESOURCE: 'overlayResource',

            //client
            //TODO these can get changed to just numbers
            DISCONNECT: '0',
            CHECKNAME: '1',
            CLIENTCOMMAND: '2',
            COMMAND: '3',
            CONNINFO: '4',
            CREATECHAR: '5',
            CREATECHARERROR: '6',
            LOGINATTEMPT: '7',
            LOGOUT: '8',
            LOGGEDIN: '9',
            PLAYERUPDATE: '10',
            SETLOGINERRORTEXT: '11',
            BOOL: '12',
            CLASSES: '13',
            CLASS: '14',
            ID: '15',
            RACES: '16',
            RACE: '17',
            SLOT: '18',
            TEXT: '19',
            STRENGTH: '20',
            STAMINA: '21',
            INTELLIGENCE: '22',
            WISDOM: '23',
            AGILITY: '24',
            DEXTERITY: '25',
            PERCEPTION: '26',
            CHARISMA: '27',
            LUCK: '28',
            AC: '29',
            FOCUS: '30',
            SKILL: '31',
            POWER: '32',
            MAXHEALTH: '33',
            CURRENTHEALTH: '34',
            MAXMANA: '35',
            CURRENTMANA: '36',
            CURRENTEXP: '37',
            LEVEL: '38',
            MAXENDURANCE: '39',
            CURRENTENDURANCE: '40',
            FROSTRES: '41',
            FIRERES: '42',
            WINDRES: '43',
            EARTHRES: '44',
            POISONRES: '45',
            SHOCKRES: '46',
            HOLYRES: 'holyres',
            SHADOWRES: 'shadowres',
            ADDCHARACTER: 'addcharacter',
            ENTERGAME: 'entergame',
            NEWMAP: 'newmap',
            PLAYERS: 'players'
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

            Acorn.Net.on(this.enums.ADDCHARACTER, function (data) {
                console.log(data);
                Player.addCharacter(data);
                Acorn.changeState('mainmenu');
            });
            
            Acorn.Net.on(this.enums.NEWMAP, function (data) {
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
            Acorn.Net.on(this.enums.SETLOGINERRORTEXT, function (data) {
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
            Acorn.Net.on(this.enums.LOGGEDIN, function (data) {
                Player.init(data);
                document.body.removeChild(MainMenu.mainPanel);
                MainMenu.showCharacterSelection();
            });

            Acorn.Net.on(this.enums.LOGOUT, function (data) {
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