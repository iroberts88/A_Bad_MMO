//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Character = require('./character.js').Character,
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Zone = require('./zone.js').Zone;

const crypto = require('crypto');

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var Player = function(){
    this.engine = null;
    this.user = null;
    this.id = null;
    this.ready = null;

    this.checkName = false;
    this.checkNameTicker = 0;
    this.checkNameText = ''
};

Player.prototype.init = function (data) {
    //init player specific variables
   
    this.netQueue = [];

    if (typeof data.socket != 'undefined'){
        this.socket = data.socket;
        this.setupSocket();
    }
    this.ready = false;
};


Player.prototype.tick = function(deltaTime){
    if (this.checkName){
        this.checkNameTicker += deltaTime;
        if (this.checkNameTicker >= 0.75){
            //send checkname
            if (this.engine.filter.isProfaneLike(this.checkNameText)){
                var d = {};
                d[this.engine.enums.BOOL] = false;
                this.engine.queuePlayer(this,this.engine.enums.CHECKNAME, d);
                return;
            }
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var params = {
                TableName: 'abm_charnames',
                Key: {
                    name: this.checkNameText
                }
            }
            var that = this;
            docClient.get(params, function(err, data) {
                var d = {};
                if (err) {
                    console.error("Unable to find user data. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    if (typeof data.Item == 'undefined'){
                        d[that.engine.enums.BOOL] = true;
                    }else{
                        d[that.engine.enums.BOOL] = false;
                    }
                }
                that.engine.queuePlayer(that,that.engine.enums.CHECKNAME, d);
            });
            this.checkNameTicker = 0;
            this.checkName = false;
        }
    }
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.engine = ge;
    this.id = ge.getId();
};
Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;


    this.socket.on(this.engine.enums.PLAYERUPDATE, function (data) {
        try{
            if (!that.engine.checkData(data,that.engine.enums.COMMAND)){return;}
            switch(data[that.engine.enums.COMMAND]){
                case that.engine.enums.LOGOUT:
                    that.engine.playerLogout(that);
                    that.engine.queuePlayer(that,that.engine.enums.LOGOUT, {});
                    break;
                case that.engine.enums.CHECKNAME:
                    //check if valid name
                    if (!that.engine.checkData(data,that.engine.enums.TEXT)){return;}
                    that.checkName = true;
                    that.checkNameTicker = 0.0;
                    that.checkNameText = data[that.engine.enums.TEXT].toLowerCase();
                    break;
                case that.engine.enums.CREATECHAR:
                    //CREATE CHARACTER
                    //check valid slot
                    if (!that.engine.checkData(data,that.engine.enums.SLOT)){return;}
                    if (!that.engine.checkData(data,that.engine.enums.RACE)){return;}
                    if (!that.engine.checkData(data,that.engine.enums.CLASS)){return;}
                    if (!that.engine.checkData(data,that.engine.enums.NAME)){return;}
                    var slot = data[that.engine.enums.SLOT];
                    var name = data[that.engine.enums.NAME] + '';
                    name = name.toLowerCase();
                    var race = data[that.engine.enums.RACE];
                    var cclass = data[that.engine.enums.CLASS];

                    if (parseInt(slot) < 1 || parseInt(slot) > 10 || typeof that.user.characters[slot] != 'undefined'){
                        var d = {};
                        d[that.engine.enums.CREATECHARERROR] = "Invalid slot!";
                        that.engine.queuePlayer(that,that.engine.enums.CREATECHARERROR, d);
                        return;
                    }
                    //check valid race/class
                    if (!that.engine.checkData(that.engine.races,race) || !that.engine.checkData(that.engine.classes,cclass)){return;}
                    if (Utils._udCheck(that.engine.races[race].availableClasses[cclass])){
                        console.log('Invalid class/race combination')
                        return;
                    }
                    //check if valid name and create
                    for (var i = 0; i < name.length;i++){
                        if (Utils._udCheck(that.engine.possibleNameChars[name.charAt(i)])){
                            var d = {};
                            d[that.engine.enums.CREATECHARERROR] = "Invalid Name!";
                            that.engine.queuePlayer(that,that.engine.enums.CREATECHARERROR, d);
                            return;
                        }
                    }
                    if (name.length < 3 || name.length > 16){
                        var d = {};
                        d[that.engine.enums.CREATECHARERROR] = "Name must be between 3 and 16 characters!";
                        that.engine.queuePlayer(that,that.engine.enums.CREATECHARERROR, d);
                        return;
                    }
                    //profanity check
                    if (that.engine.filter.isProfaneLike(this.checkNameText)){
                        var d = {};
                        d[that.engine.enums.CREATECHARERROR] = "Bad words!";
                        that.engine.queuePlayer(that,that.engine.enums.CREATECHARERROR, d);
                        return;
                    }
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'abm_charnames',
                        Key: {
                            name: name
                        }
                    }
                    docClient.get(params, function(err, data) {
                        var d = {};
                        if (err) {
                            console.error("Unable to find user data. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            if (typeof (data.Items != 'undefined')){
                                console.log("All data valid - create character!!")
                                //name = name.charAt(0).toUpperCase() + name.substr(1);
                            }
                        }
                    });
                    break;
                case that.engine.enums.REQUESTMAPDATA:
                    //TODO - zone data to client obj???
                    /*try{
                        var zoneData = that.engine.zones[data.name].zoneData;
                        that.engine.queuePlayer(that,that.engine.enums.MAPDATA,{
                            zoneData: zoneData,
                            name: data.name
                        });
                    }catch(e){
                        that.engine.debug(that,{id: 'requestMapDataError', error: e.stack});
                    }*/
                    break;
            }
        }catch(e){
            console.log(that.engine.debug('playerUpdateError',e,data));
        }
    });


    this.socket.on(this.engine.enums.CLIENTCOMMAND, function(data) {
        // this needs to be parsed: data.cString
        // format: >COMMAND ID AMOUNT
        //commands:
        /*if (data.cString.length > 128){
            return;
        }
        try{
            if (data.cString.charAt(0) != '/'){
                //its a SAY command
                if (data.cString == ''){
                    return;
                }
                if (that.battle){
                    var u = that.user.userData.username
                    that.battle.sendChat(u.toUpperCase() + ': ' + data.cString);
                    return
                }
                console.log('Say: ' + data.cString);
                var players = [];
                //send a move command to all players in adjacent sectors
                var zone = that.engine.zones[that.character.currentMap];
                var coords = zone.getSectorXY(that.character.currentSector);
                for (var i = -1;i < 2;i++){
                    for (var j = -1;j < 2;j++){
                        try{
                            for (var pl in zone.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                                var player = zone.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                                that.engine.queuePlayer(player,"say", {id: that.id,text: data.cString});
                            }
                        }catch(e){
                            that.engine.debug(that,{id: 'chatAttempt', error: e.stack});
                        }
                    }
                }
                return;
            }
            var commandBool = false;
            var c = data.cString.substring(1,data.cString.length);
            var commands = [];
            var from = 0;
            for (var i = 0; i < c.length; i++){
                if (c.charAt(i) === ' '){
                    commands.push(c.substring(from,i))
                    from = i+1;
                }
            }
            commands.push(c.substring(from,c.length));
            console.log(commands);
            switch (commands[0]){
                case 'battle':
                    if (that.battle != null){console.log("Battle exists");return;}
                    console.log("Start Battle");
                    var pokemon = [Math.ceil(Math.random()*15)];
                    var levels = [5];//[Math.ceil(Math.random()*20)];

                    var battle = new Battle(that.engine);
                    var pkmn = new Trainer(that.engine);
                    pkmn.init({wild: true,pokemon:pokemon,levels:levels});
                    if (battle.init({team1: [that.character],team2: [pkmn],type: '1v1'})){
                        console.log("Battle successfully initialized!!");
                        that.battle = battle;
                        that.engine.activeBattles[battle.id] = battle;
                    }
                    break;
                case 'arp':
                    console.log("Adding Random Pokemon!");
                    var pokemon = Math.ceil(Math.random()*15);
                    var level = Math.ceil(Math.random()*100);

                    var newPoke = new Pokemon();
                    newPoke.init(that.engine.pokemon[pokemon],{
                        character: that.character,
                        nickname: '',
                        level: level,
                        id: that.engine.getId()
                    })
                    that.character.addPokemon(newPoke);
                    break;
            }
        }catch(e){
            console.log(e);
        }
        */
    });

    this.socket.on(this.engine.enums.disconnect, function () {
        try{
            that.user.unlock();
            console.log('Player ' + that.id + ' (' + that.user.userData.username + ') has disconnected.');
            that.user.updateDB();
            that.engine.removePlayer(that);
            // If callback exists, call it
            if(that.onDisconnectHandler != null && typeof that.onDisconnectHandler == 'function' ) {
                that.onDisconnectHandler();
            }
        }catch(e){
            console.log('error on disconnect ( will error out on guest or user = null)');
        }
    });

    
    this.socket.on(this.engine.enums.LOGINATTEMPT, function (d) {
        if (that.user){return;}
        try{
            if (d.sn && d.pw){
                d.sn = d.sn.toLowerCase();
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d.sn
                    }
                }
                docClient.get(params, function(err, data) {
                    try{
                        if (err) {
                            console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            if (typeof data.Item != 'undefined'){
                                const hash = crypto.createHmac('sha256', d.pw);
                                if (hash.digest('hex') == data.Item.password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(data.Item);
                                    that.user.lock();
                                    that.engine.users[d.sn] = that.user;
                                    that.engine.queuePlayer(that,"loggedIn", {name:data.Item.username, characters: that.user.characters});
                                }else{
                                    that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'wrongpass'});
                                }
                            }else{
                                that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'wrongpass'});
                            }
                        }
                    }catch(e){
                        console.log(e);
                    }
                });
            }
        }catch(e){
            console.log('Login Attempt failed');
            console.log(e);
            that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'wrongpass'});
        }
    });
    this.socket.on('guestLogin', function (d) {
        console.log(d);
        if (that.user){return;}
        try{
            d.sn = d.sn.toLowerCase();
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var params = {
                TableName: 'users',
                Key: {
                    username: d.sn
                }
            }
            docClient.get(params, function(err, data) {
                if (err) {
                } else {
                    console.log("Attempting guest logon...");
                    if (d.sn.length >= 3 && d.sn.length <= 16 && typeof data.Item == 'undefined' && typeof that.engine.users[d.sn] == 'undefined'){
                        console.log('valid username - adding guest');
                        var u = {
                            username: d.sn,
                            guest: true
                        };
                        that.user = User();
                        that.user.setOwner(that);
                        that.user.init(u);
                        that.engine.users[d.sn] = that.user;
                        that.engine.queuePlayer(that,"loggedIn", {name:d.sn, characters: that.user.characters});
                    }else if (typeof data.Item != 'undefined' || typeof that.engine.users[d.sn] != 'undefined'){
                        that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'userexists'});
                    }else{
                        that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'snlength'});
                    }
                }
            });
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
    this.socket.on('createUser', function (d) {
        console.log(d);
        if (that.user){return;}
        try{
            d.sn = d.sn.toLowerCase();
            if (typeof that.engine.users[d.sn] == 'undefined'){
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d.sn
                    }
                };
                docClient.get(params, function(err, data) {
                    if (err) {
                        console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        //check password lengths, and if item exists
                        console.log("Create user succeeded:", JSON.stringify(data, null, 2));
                        if (d.sn.length >= 3 && d.sn.length <= 16 && d.pw.length >= 6 && typeof data.Item == 'undefined'){
                            console.log('valid account info - creating account');
                            //first, initialize the user data
                            var params2 = {
                                TableName: 'blaine_userdata',
                                Item: {
                                    'username': d.sn,
                                    'characters': {},
                                }
                            }
                            docClient.put(params2, function(err, data2) {
                                if (err) {
                                    console.error("Unable to add user data. Error JSON:", JSON.stringify(err, null, 2));
                                } else {
                                    console.log("Create userdata succeeded:", JSON.stringify(data2, null, 2));
                                    //hash the password
                                    const hash = crypto.createHmac('sha256', d.pw);
                                    var u = {
                                        username: d.sn,
                                        password: hash.digest('hex')
                                    };
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(u);
                                    that.engine.users[d.sn] = that.user;
                                    that.engine.queuePlayer(that,"loggedIn", {name:d.sn, characters: that.user.characters});
                                    var params3 = {
                                        TableName: 'users',
                                        Item: {
                                            'username': d.sn,
                                            'password': that.user.userData.password,
                                            'admin': false,
                                            'loggedin': true,
                                            'createDate': new Date().toJSON(),
                                            'lastLogin': new Date().toJSON()
                                        }
                                    }
                                    docClient.put(params3, function(err, data3) {
                                        if (err) {
                                            console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
                                        } else {
                                            console.log("Create user succeeded:", JSON.stringify(data3, null, 2));
                                        }
                                    });
                                }
                            });
                            
                        }else if (typeof data.Item != 'undefined'){
                            that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'userexists'});
                        }else if (d.sn.length < 3 || d.sn.length > 16){
                            that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'snlength'});
                        }else if (d.pw.length < 8 || d.pw.length > 16){
                            that.engine.queuePlayer(that,that.engine.enums.SETLOGINERRORTEXT, {text: 'plength'});
                        }
                    }
                });
            }else{
                //user exists
                that.engine.queuePlayer(that,"setLoginErrorText", {text: 'userexists'});
            }
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
};

exports.Player = Player;
