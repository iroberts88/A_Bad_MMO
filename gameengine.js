//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Zone = require('./zone.js').Zone,
    Race = require('./race.js').Race,
    CharClass = require('./charclass.js').CharClass, 
    fs = require('fs'),
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    Filter = require('bad-words'),
    AWS = require("aws-sdk");

var self = null;

var GameEngine = function() {
    this.users = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();

    this.players = {};
    this.playerCount = 0;

    this.classes = {};
    this.races = {};
    this.items = {};

    //database objects
    this.mapids = [];
    this.mapCount = 0; //for checking if all maps have loaded before ready

    this.zones = {};
    this.zoneUpdateList = {}; //a list of zones with active players to update

    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";

    this.debugList = {}; //used avoid overloading debug.txt
    this.ready = false;

    this.possibleNameChars = {};

    fs.truncate('debug.txt', 0, function(){console.log('debug.txt cleared')})
    this.debugWriteStream = fs.createWriteStream('debug.txt', {AutoClose: true});

    this.filter = new Filter();
    
    this.enums = {
        //DB
        //need to match the DB values
        MAPDATA: 'mapData',
        CLASSID: 'classid',
        DESCRIPTION: 'description',
        DISCONNECT: 'disconnect',
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
        AC: 'ac',
        ADDCHARACTER: 'addcharacter',
        ADDPC: 'addPC',
        AGILITY: 'agility',
        BOOL: 'bool',
        CHARACTERS: 'characters',
        CHARISMA: 'charisma',
        CHECKNAME: 'checkName',
        CLIENTCOMMAND: 'clientCommand',
        CLASSES: 'classes',
        CLASS: 'class',
        COMMAND: 'command',
        CONNINFO: 'connInfo',
        CREATECHAR: 'CreateChar',
        CREATECHARERROR: 'createCharError',
        CURRENTENDURANCE: 'currentEndurance',
        CURRENTEXP: 'currentExp',
        CURRENTHEALTH: 'currentHealth',
        CURRENTMANA: 'currentMana',
        DEXTERITY: 'dexterity',
        EARTHRES: 'earthRes',
        ENTERGAME: 'entergame',
        FOCUS: 'focus',
        FIRERES: 'fireRes',
        FROSTRES: 'frostRes',
        HOLYRES: 'holyres',
        ID: 'id',
        INTELLIGENCE: 'intelligence',
        LEVEL: 'level',
        LOGINATTEMPT: 'loginAttempt',
        LOGOUT: 'logout',
        LOGGEDIN: 'loggedIn',
        LUCK: 'luck',
        MAXENDURANCE: 'maxEndurance',
        MAXHEALTH: 'maxHealth',
        MAXMANA: 'macMana',
        MOVE: 'move',
        MOVEVECTOR: 'moveVector',
        NEWMAP: 'newmap',
        OWNER: 'owner',
        PERCEPTION: 'perception',
        PLAYERS: 'players',
        PLAYERUPDATE: 'playerUpdate',
        POISONRES: 'poisonRes',
        POSITION: 'position',
        POSUPDATE: 'posUpdate',
        POWER: 'power',
        RACES: 'races',
        RACE: 'race',
        REMOVEPC: 'removePC',
        SETLOGINERRORTEXT: 'setLoginErrorText',
        SHADOWRES: 'shadowres',
        SHOCKRES: 'shockRes',
        SKILL: 'skil',
        SLOT: 'slot',
        SPEED: 'speed',
        STRENGTH: 'strength',
        STAMINA: 'stamina',
        TEXT: 'text',
        WINDRES: 'windRes',
        WISDOM: 'wisdom'
  };
}

GameEngine.prototype.init = function () {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < letters.length;i++){
        this.possibleNameChars[letters.charAt(i)] = true;
    }
    this.start();
};

GameEngine.prototype.start = function () {
    console.log('Starting Game Engine.');
    console.log('Ready. Waiting for players to connect...');
    self = this;
    setInterval(this.tick, this.gameTickInterval);
}

GameEngine.prototype.tick = function() {
    var now = Date.now();
    var deltaTime = (now-self.lastTime) / 1000.0;
    //update all zones with players
    for (var z in self.zoneUpdateList){
        var zone = self.zones[z];
        zone.tick(deltaTime);
    }


    for (var p in self.players){
        self.players[p].tick(deltaTime);
    }
    
    //update debug list
    for (var k in self.debugList){
        self.debugList[k].t -= deltaTime;
        if (self.debugList[k].t <= -5.0){
            //debug hasnt been updated in 5 seconds
            //remove from debug list
            console.log('deleting debug with id ' + self.debugList[k].id);
            delete self.debugList[k];
        }
    }
    self.emit();
    self.clearQueue();
    self.lastTime = now;
}

GameEngine.prototype.getId = function() {
    var id = this.idIterator + 'x';
    for(var i=0; i<3; i++){
        id += this.possibleIDChars.charAt(Math.floor(Math.random() * this.possibleIDChars.length));
    }
    this.idIterator += 1;
    return id;
}

// ----------------------------------------------------------
// Database loading functions
// ----------------------------------------------------------

GameEngine.prototype.loadMaps = function(arr) {
    for (var i = 0; i < arr.length;i++){
        var d;
        fs.readFile('./mapgen_tool/maps/' + arr[i], "utf8",function read(err, data) {
            if (err) {
                throw err;
            }
            var obj = JSON.parse(data);
            self.mapids.push(obj.mapid);

            var newZone = new Zone(self);
            newZone.init(obj);
            self.zones[newZone.mapid] = newZone;

            if (self.mapids.length == self.mapCount){
                self.ready = true;
            }
        });
    }
    console.log('loaded ' + arr.length + ' Maps from file');
}

GameEngine.prototype.loadRaces = function(arr){
    for (var i = 0; i < arr.length;i++){
        var race = new Race(self);
        race.init(arr[i]);
        self.races[arr[i].raceid] = race;
    }
    console.log('loaded ' + arr.length + ' Races from file');
}
GameEngine.prototype.loadClasses = function(arr){
    for (var i = 0; i < arr.length;i++){
        var charclass = new CharClass(self);
        charclass.init(arr[i]);
        self.classes[arr[i].classid] = charclass;
    }
    console.log('loaded ' + arr.length + ' Classes from file');
}

//Player functions
GameEngine.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
}

GameEngine.prototype.removePlayer = function(p){
    this.playerLogout(p);
    if (p.activeChar){
        this.removePlayerFromZone(p.activeChar,p.activeChar.currentZone);
    }
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameEngine.prototype.addPlayerToZone = function(p,z){
    var count = this.zones[z].addPlayer(p);
    p.zoneid = z;
    if (count == 1){
        //zone is no longer empty, ready to update
        this.zoneUpdateList[z] = true;
    }
}

GameEngine.prototype.removePlayerFromZone = function(p,z){
    var count = z.removePlayer(p);

    if (count == 0){
        //zone is empty, no longer update
        delete this.zoneUpdateList[z.mapid]; 
    }
}

GameEngine.prototype.playerLogout = function(p){
    try{
        delete this.users[p.user.userData.username];
    }catch(e){
        console.log("error on player logout");
    }
    p.user.unlock();
    p.user.updateDB();
    p.user = null;
}

GameEngine.prototype.checkData = function(obj,key){
    if (Utils._udCheck(obj[key])){
        console.log('INVALID DATA - ' + key)
        console.log(obj);
        return false;
    }else{
        return true;
    }
}

// ----------------------------------------------------------
// Socket Functions
// ----------------------------------------------------------

GameEngine.prototype.newConnection = function(socket) {
    if (self.ready){
        console.log('New Player Connected');
        console.log('Socket ID: ' + socket.id);
        //Initialize new player
        var p = new Player();
        p.setGameEngine(self);
        console.log('Player ID: ' + p.id);
        p.init({socket:socket});
        //sned down initial client data
        var data = {}
        data[self.enums.ID] = p.id;
        data[self.enums.CLASSES] = {};
        for (var i in self.classes){
            data[self.enums.CLASSES][i] = self.classes[i].getClientObj();
        }
        data[self.enums.RACES] = {};
        for (var i in self.races){
            data[self.enums.RACES][i] = self.races[i].getClientObj();
        }
        self.queuePlayer(p,self.enums.CONNINFO, data);
        self.addPlayer(p);
    }
}

GameEngine.prototype.emit = function() {
    try{
        for(var i in this.players) {
            if (this.players[i].netQueue.length > 0){
                this.players[i].socket.emit('serverUpdate', this.players[i].netQueue);
            }
        }
    }catch(e){
        try{
            console.log(this.players[i].netQueue);
        }catch(e){}
        console.log(e);
        console.log(i);
    }
}
GameEngine.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

//Queue data to all players
GameEngine.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
        this.players[i].netQueue.push(data);
    }
}
//Queue data to a specific player
GameEngine.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

//Queue DEBUG data to a specific player
GameEngine.prototype.debug = function(id,e,d) {
    if (Utils._udCheck(this.debugList[id])){
        //new debug error
        //add to debug list and send to client
        this.debugList[id] = {
            id: id,
            n: 1,
            t: 5.0
        }
        d.n = 1;
        console.log('debug.txt updated - ' + id);
        this.debugWriteStream.write(new Date().toJSON() + ' - ' + id + ' \n ' + e.stack + ' \n ' + JSON.stringify(d) + '\n\n');
    }else{
        this.debugList[id].n += 1;
        d.n = this.debugList[id].n
        if (this.debugList[id].t <= 0){
            console.log('debug.txt updated (duplicate error) - ' + id);
            this.debugWriteStream.write(new Date().toJSON() + ' - ' + id + ' \n ' + e.stack + ' \n ' + JSON.stringify(d) + '\n\n');
            this.debugList[id].t = 5.0;
        }
    }
}

exports.GameEngine = GameEngine;