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
    this.zoneUpdateList = {}; //a list of zones with active players

    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";

    this.debugList = {}; //used avoid multiple debug chains in tick()
    this.ready = false;

    this.possibleNameChars = {};

    fs.truncate('debug.txt', 0, function(){console.log('debug.txt cleared')})
    this.debugWriteStream = fs.createWriteStream('debug.txt', {AutoClose: true});

    this.filter = new Filter();
    
    this.enums = {
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
    this.removePlayerFromZone(p,p.character.currentMap);
    delete this.users[p.user.userData.username];
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameEngine.prototype.addPlayerToZone = function(p,z){
    var count = this.zones[z].addPlayer(p);

    if (count == 1){
        //zone is no longer empty, ready to update
        this.zoneUpdateList[z] = true;
    }
}

GameEngine.prototype.removePlayerFromZone = function(p,z){
    var count = this.zones[z].removePlayer(p);

    if (count == 0){
        //zone is empty, no longer update
        delete this.zoneUpdateList[z]; 
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