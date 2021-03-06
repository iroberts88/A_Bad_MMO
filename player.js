//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Character = require('./character.js').Character,
    PlayerItem = require('./inventory.js').PlayerItem,
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Enums = require('./enums.js').Enums,
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

    this.activeChar = null;
    this.checkName = false;
    this.checkNameTicker = 0;
    this.checkNameText = ''

    this.currentChatType = 'say';

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
            console.log(this.checkNameText)
            //send checkname
            if (this.engine.filter.isProfaneLike(this.checkNameText)){
                var d = {};
                d[Enums.BOOL] = false;
                this.engine.queuePlayer(this,Enums.CHECKNAME, d);
                this.checkNameTicker = 0;
                this.checkName = false;
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
                        d[Enums.BOOL] = true;
                    }else{
                        d[Enums.BOOL] = false;
                    }
                }
                that.engine.queuePlayer(that,Enums.CHECKNAME, d);
            });
            this.checkNameTicker = 0;
            this.checkName = false;
        }
    }
    if (this.activeChar){
        this.activeChar.update(deltaTime);
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

    this.socket.on(Enums.PLAYERUPDATE, function (data) {
        try{
            if (!that.engine.checkData(data,Enums.COMMAND)){return;}
            switch(data[Enums.COMMAND]){
                case Enums.LOGOUT:
                    that.engine.playerLogout(that);
                    that.engine.queuePlayer(that,Enums.LOGOUT, {});
                    break;
                case Enums.CHECKNAME:
                    //check if valid name
                    if (!that.engine.checkData(data,Enums.TEXT)){return;}
                    that.checkName = true;
                    that.checkNameTicker = 0.0;
                    that.checkNameText = data[Enums.TEXT].toLowerCase();
                    break;
                case Enums.CREATECHAR:
                    //CREATE CHARACTER
                    //check valid slot
                    if (!that.engine.checkData(data,Enums.SLOT)){return;}
                    if (!that.engine.checkData(data,Enums.RACE)){return;}
                    if (!that.engine.checkData(data,Enums.CLASS)){return;}
                    if (!that.engine.checkData(data,Enums.NAME)){return;}
                    var slot = data[Enums.SLOT];
                    var name = data[Enums.NAME] + '';
                    name = name.toLowerCase();
                    var race = data[Enums.RACE];
                    var cclass = data[Enums.CLASS];

                    if (parseInt(slot) < 1 || parseInt(slot) > 10 || typeof that.user.characters[slot] != 'undefined'){
                        var d = {};
                        d[Enums.CREATECHARERROR] = "Invalid slot!";
                        that.engine.queuePlayer(that,Enums.CREATECHARERROR, d);
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
                            d[Enums.CREATECHARERROR] = "Invalid Name!";
                            that.engine.queuePlayer(that,Enums.CREATECHARERROR, d);
                            return;
                        }
                    }
                    if (name.length < 3 || name.length > 16){
                        var d = {};
                        d[Enums.CREATECHARERROR] = "Name must be between 3 and 16 characters!";
                        that.engine.queuePlayer(that,Enums.CREATECHARERROR, d);
                        return;
                    }
                    //profanity check
                    if (that.engine.filter.isProfaneLike(this.checkNameText)){
                        var d = {};
                        d[Enums.CREATECHARERROR] = "Bad words!";
                        that.engine.queuePlayer(that,Enums.CREATECHARERROR, d);
                        return;
                    }
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'abm_charnames',
                        Key: {
                            name: name
                        }
                    }
                    data.engine = that.engine;
                    data.owner = that;
                    docClient.get(params, function(err, dbData) {
                        var d = {};
                        if (err) {
                            console.error("Unable to find user data. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            if (typeof (data.Items != 'undefined')){
                                console.log("All data valid - create character!!")
                                name = name.charAt(0).toUpperCase() + name.substr(1);
                                var newChar = new Character();
                                console.log(data);
                                data['name'] = name;
                                data.scale = 2;
                                newChar.init(data);
                                newChar.setRace();
                                newChar.setClass();
                                newChar.name = name;
                                that.user.addCharacter(slot,newChar);
                            }
                        }
                    });
                    break;
                case Enums.ENTERGAME:
                    //check if the slot is a valid character
                    if (!that.engine.checkData(data,Enums.SLOT)){return;}
                    var slot = data[Enums.SLOT];
                    if (parseInt(slot) < 1 || parseInt(slot) > 10 || typeof that.user.characters[slot] == 'undefined'){
                        console.log('Player Error - Invalid Slot')
                        return;
                    }
                    //Add to zone/sector
                    that.activeChar = that.user.characters[slot];
                    that.engine.queuePlayer(that,Enums.GETINVENTORY,that.activeChar.inventory.getClientData());
                    that.engine.addPlayerToZone(that.activeChar,that.activeChar.zoneid);
                    break;
                case Enums.REQUESTMAPDATA:
                    /*try{
                        var zoneData = that.engine.zones[data.name].zoneData;
                        that.engine.queuePlayer(that,Enums.MAPDATA,{
                            zoneData: zoneData,
                            name: data.name
                        });
                    }catch(e){
                        that.engine.debug(that,{id: 'requestMapDataError', error: e.stack});
                    }*/
                    break;
                case Enums.MOVE:
                    that.activeChar.moveVector.x = data[Enums.MOVEVECTOR][0];
                    that.activeChar.moveVector.y = data[Enums.MOVEVECTOR][1];
                    //TODO check if valid move!
                    that.activeChar.hb.pos.x = data[Enums.POSITION][0];
                    that.activeChar.hb.pos.y = data[Enums.POSITION][1];
                    for (var i in that.activeChar.pToUpdate){
                        var d = {};
                        d[Enums.ID] = that.activeChar.id;
                        d[Enums.POSITION] = data[Enums.POSITION];
                        d[Enums.MOVEVECTOR] = data[Enums.MOVEVECTOR];
                        that.engine.queuePlayer(that.activeChar.pToUpdate[i].owner,Enums.POSUPDATE, d);
                    }
                    break;
                case Enums.MOVEITEM:
                    if (!that.engine.checkData(data,Enums.BAG)){return;}
                    if (!that.engine.checkData(data,Enums.POSITION,'object')){return;}
                    if (!that.engine.checkData(data,Enums.FLIPPED,'boolean')){return;}
                    if (!that.engine.checkData(data,Enums.ID,'string')){return;}
                    that.activeChar.inventory.moveItem(data);
                    break;
                case Enums.EQUIPITEM:
                    if (!that.engine.checkData(data,Enums.SLOT)){return;}
                    if (!that.engine.checkData(data,Enums.ITEM)){return;}
                    that.activeChar.inventory.equipItem(data[Enums.SLOT],data[Enums.ITEM]);
                    break;
                case Enums.SETTARGET:
                    if (!that.engine.checkData(data,Enums.UNIT)){return;}
                    //get the unit
                    var unit = that.activeChar.currentZone.getUnit(data[Enums.UNIT]);
                    if (!unit){
                        return;
                    }
                    that.activeChar.setTarget(unit);
                    break;
                case Enums.CLEARTARGET:
                    that.activeChar.clearTarget();
                    that.activeChar.meleeOn = false;
                    that.activeChar.rangedOn = false;
                    break;
                case Enums.SETMELEEATTACK:
                    console.log(data);
                    if (!that.engine.checkData(data,Enums.BOOL,'boolean')){return;}
                    if (data[Enums.BOOL]){
                        that.activeChar.rangedOn = false;
                    }
                    that.activeChar.meleeOn = data[Enums.BOOL];
                    break;
                case Enums.SETRANGEDATTACK:
                    console.log(data);
                    if (!that.engine.checkData(data,Enums.BOOL,'boolean')){return;}
                    if (data[Enums.BOOL]){
                        that.activeChar.meleeOn = false;
                    }
                    that.activeChar.rangedOn = data[Enums.BOOL];
                    break;
            }
        }catch(e){
            console.log(that.engine.debug('playerUpdateError',e,data));
        }
    });



    this.socket.on('disconnect', function () {
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

    //TODO CONVERT LOGIN COMMANDS TO Enums
    
    this.socket.on(Enums.LOGINATTEMPT, function (d) {
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
                                    that.engine.queuePlayer(that,Enums.LOGGEDIN, {name:data.Item.username, characters: that.user.characters});
                                }else{
                                    that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'wrongpass'});
                                }
                            }else{
                                that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'wrongpass'});
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
            that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'wrongpass'});
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
                        that.engine.queuePlayer(that,Enums.LOGGEDIN, that.user.getClientData());
                    }else if (typeof data.Item != 'undefined' || typeof that.engine.users[d.sn] != 'undefined'){
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'userexists'});
                    }else{
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'snlength'});
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
                                    that.engine.queuePlayer(that,Enums.LOGGEDIN, {name:d.sn, characters: that.user.characters});
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
                            that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'userexists'});
                        }else if (d.sn.length < 3 || d.sn.length > 16){
                            that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'snlength'});
                        }else if (d.pw.length < 8 || d.pw.length > 16){
                            that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, {text: 'plength'});
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

    this.socket.on(Enums.CLIENTCOMMAND, function(data) {
        if (!that.engine.checkData(data,Enums.COMMAND)){return;}
        var cmd = data[Enums.COMMAND];
        //MAX LENGTH?
        if (cmd.length > 200 || cmd == ''){
            return;
        }
        try{
            if (cmd.charAt(0) == ':'){ //TODO && user.admin == true
                //parse dev command
                cmd = cmd.substring(0,cmd.length);
                var command = '';
                var string = '';
                for (var i = 1; i < cmd.length;i++){
                    if (cmd.charAt(i) == ' '){
                        string = cmd.substring(i+1,cmd.length);
                        break;
                    }
                    command += cmd.charAt(i);
                }
                that.parseCommand(command,string,true);
                return;
            }
            if (cmd.charAt(0) != '/'){
                //use default chat type to send message
                that.parseCommand(that.currentChatType,cmd);
            }else{
                //parse normal command
                cmd = cmd.substring(0,cmd.length);
                var command = '';
                var string = '';
                for (var i = 1; i < cmd.length;i++){
                    if (cmd.charAt(i) == ' '){
                        string = cmd.substring(i+1,cmd.length);
                        break;
                    }
                    command += cmd.charAt(i);
                }
                that.parseCommand(command,string,false);
            }

        }catch(e){
            that.engine.debug('clientCommandError',e,data);
        }
        
    });
};

Player.prototype.parseCommand = function(cmd,string,dev) {
    cmd = cmd.toLowerCase();
    if (dev){
        console.log("Parsing DEV Command: " + cmd);
        console.log('args-' + string);
        var args = [];
        start = 0;
        for (var i = 0; i < string.length;i++){
            if (string.charAt(i) == ' '){
                args.push(string.substring(start,i));
                start = i+1;
            }else if (i >= string.length-1){
                args.push(string.substring(start,string.length));
            }
        }
        console.log(args);
        switch(cmd){
            case 'addall':
                for (var i in this.engine.items){
                    this.activeChar.inventory.addItemById(i,1);
                }
                break;
            case 'additem':
                if (typeof args[0] == 'undefined'){
                    console.log("missing item id");
                    return;
                }
                if (typeof args[1] == 'undefined'){
                    args.push(1);
                }
                this.activeChar.inventory.addItemById(args[0],parseInt(args[1]));
                break;
            case 'modstat':
                if (typeof args[0] == 'undefined'){
                    console.log("missing item id");
                    return;
                }
                if (typeof args[1] == 'undefined'){
                    args.push(1);
                }
                this.activeChar.modStat({
                    stat: args[0],
                    value: parseInt(args[1]),
                });
                break;
            case 'setstat':
                //this will force the base stat
                if (typeof args[0] == 'undefined'){
                    console.log("missing item id");
                    return;
                }
                if (typeof args[1] == 'undefined'){
                    args.push(1);
                }
                this.activeChar.modStat({
                    stat: args[0],
                    value: parseInt(args[1])
                    //set: true
                });
                break;
            case 'levelup':
                //for quick testing purposes
                this.activeChar.levelUp();
                break;
            case 'lvl':
                //for quick testing purposes
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                this.activeChar.levelUp();
                break;
            case 't':
                //for quick testing purposes
                this.activeChar.inventory.addItemById('w_branch', 2);
                break;
        }
        return;
    }
    console.log("Parsing Command: " + cmd);
    console.log('args-' + string);
    switch(cmd){
        case 'say':
            this.currentChatType = 's';
            this.activeChar.currentZone.say(this.activeChar,string);
            break;
        case 's':
            this.currentChatType = 's';
            this.activeChar.currentZone.say(this.activeChar,string);
            break;
        case 'party':
            break;
        case 'p':
            break;
        case 'guild':
            break;
        case 'g':
            break;
        case 'zone':
            this.currentChatType = 'z';
            this.activeChar.currentZone.msg(this.activeChar,string);
            break;
        case 'z':
            this.currentChatType = 'z';
            this.activeChar.currentZone.msg(this.activeChar,string);
            break;
        case 'shout':
            this.currentChatType = 'sh';
            this.activeChar.currentZone.shout(this.activeChar,string);
            break;
        case 'sh':
            this.currentChatType = 'sh';
            this.activeChar.currentZone.shout(this.activeChar,string);
            break;
        case 'tell':
            break;
        case 't':
            break;
        case 'whisper':
            this.currentChatType = 'w';
            this.activeChar.currentZone.whisper(this.activeChar,string);
            break;
        case 'w':
            this.currentChatType = 'w';
            this.activeChar.currentZone.whisper(this.activeChar,string);
            break;
        case 'raid':
            break;
        case 'r':
            break;
        case 'auction':
            break;
        case 'a':
            break;
        case 'yell':
            this.currentChatType = 'y';
            this.activeChar.currentZone.shout(this.activeChar,string);
            break;
        case 'y':
            this.currentChatType = 'y';
            this.activeChar.currentZone.shout(this.activeChar,string);
            break;
    }
};

exports.Player = Player;
