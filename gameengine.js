//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Zone = require('./zone.js').Zone,
    Race = require('./race.js').Race,
    CharClass = require('./charclass.js').CharClass,
    Inventory = require('./inventory.js').Inventory,
    PlayerItem = require('./inventory.js').PlayerItem,
    Enums = require('./enums.js').Enums,
    Item = require('./inventory.js').Item,
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
    this.enemies = {};
    this.enemyDimensions = {};
    this.buffs = {};
    this.spawns = {};
    this.items = {};
    this.factions = {};

    this.behaviour = require('./behaviour.js').Behaviour;

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
    
    
    this.slotEnums = {
        'ear': Enums.EAR,
        'head': Enums.HEAD,
        'face': Enums.FACE,
        'neck': Enums.NECK,
        'arms': Enums.ARMS,
        'back': Enums.BACK,
        'shoulders': Enums.SHOULDERS,
        'chest': Enums.CHEST,
        'wrist': Enums.WRIST,
        'hands': Enums.HANDS,
        'finger': Enums.FINGER,
        'waist': Enums.WAIST,
        'legs': Enums.LEGS,
        'feet': Enums.FEET,
        'trinket': Enums.TRINKET,
        'main': Enums.MAIN,
        'secondary': Enums.SECONDARY,
        'ranged': Enums.RANGED,
        'ammo': Enums.AMMO,
        'bag': Enums.BAG,
    };

    this.slotEnums2 = {};
    this.slotEnums2[Enums.HEAD] = 'head';

    this.slotEnums2[Enums.EAR1] = 'ear';
    this.slotEnums2[Enums.EAR2] = 'ear';
    this.slotEnums2[Enums.HEAD] = 'head';
    this.slotEnums2[Enums.FACE] = 'face';
    this.slotEnums2[Enums.NECK] = 'neck';
    this.slotEnums2[Enums.ARMS] = 'arms';
    this.slotEnums2[Enums.BACK] = 'back';
    this.slotEnums2[Enums.SHOULDERS] = 'shoulders';
    this.slotEnums2[Enums.CHEST] = 'chest';
    this.slotEnums2[Enums.WRIST1] = 'wrist';
    this.slotEnums2[Enums.WRIST2] = 'wrist';
    this.slotEnums2[Enums.HANDS] = 'hands';
    this.slotEnums2[Enums.FINGER1] = 'finger';
    this.slotEnums2[Enums.FINGER2] = 'finger';
    this.slotEnums2[Enums.WAIST] = 'waist';
    this.slotEnums2[Enums.LEGS] = 'legs';
    this.slotEnums2[Enums.FEET] = 'feet';
    this.slotEnums2[Enums.TRINKET1] = 'trinket';
    this.slotEnums2[Enums.TRINKET2] = 'trinket';
    this.slotEnums2[Enums.MAIN] = 'main';
    this.slotEnums2[Enums.SECONDARY] = 'secondary';
    this.slotEnums2[Enums.RANGED] = 'ranged';
    this.slotEnums2[Enums.AMMO] = 'ammo';
    this.slotEnums2[Enums.BAG1] = 'bag';
    this.slotEnums2[Enums.BAG2] = 'bag';
    this.slotEnums2[Enums.BAG3] = 'bag';
    this.slotEnums2[Enums.BAG4] = 'bag';

    this.statEnums = {
        'strength': Enums.STRENGTH,
        'stamina': Enums.STAMINA,
        'agility': Enums.AGILITY,
        'dexterity': Enums.DEXTERITY,
        'intelligence': Enums.INTELLIGENCE,
        'wisdom': Enums.WISDOM,
        'charisma': Enums.CHARISMA,
        'perception': Enums.PERCEPTION,
        'luck': Enums.LUCK,
        'spirit': Enums.SPIRIT,
        'ac': Enums.AC,
        'maxHealth': Enums.MAXHEALTH
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
    var deltaTime = (now/1000-self.lastTime/1000) ;
    self.lastTime = now;
    //update all zones with players
    for (var z in self.zones){
        self.zones[z].tick(deltaTime);
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

GameEngine.prototype.loadItems = function(d){
    for (var i = 0; i < d['items'].length;i++){
        var item = new Item(self);
        item.init(d['items'][i]);
        self.items[d['items'][i].itemid] = item;
    }
    console.log('loaded ' + d['items'].length + ' Items from file');
}

GameEngine.prototype.loadRaces = function(d){
    for (var i = 0; i < d['items'].length;i++){
        var race = new Race(self);
        race.init(d['items'][i]);
        self.races[d['items'][i]['raceid']] = race;
    }
    console.log('loaded ' + d['items'].length + ' Races from file');
}

GameEngine.prototype.loadClasses = function(d){
    console.log(d['items']);
    for (var i = 0; i < d['items'].length;i++){
        var charclass = new CharClass(self);
        charclass.init(d['items'][i]);
        self.classes[d['items'][i]['classid']] = charclass;
    }
    console.log('loaded ' + d['items'].length + ' Classes from file');
}

GameEngine.prototype.loadEnemies = function(d){
    for (var i = 0; i < d['items'].length;i++){
        self.enemies[d['items'][i].enemyid] = d['items'][i];
        if (d['items'][i]['elite']){
            self.enemies[d['items'][i]['enemyid']]['classid'] = 'elite';
        }else{
            self.enemies[d['items'][i]['enemyid']]['classid'] = 'enemy';
        }
    }
    console.log('loaded ' + d['items'].length + ' Enemies from file');
}

GameEngine.prototype.getEnemyDimensions = function(arr){
    for (var i in arr['frames']){
        if(i.substring(0,6) == 'enemy_'){
            //get base dimensions!
            self.enemyDimensions[i.substring(0,i.length-4)] = arr['frames'][i]['frame']['w'];
        }
    }
    console.log(self.enemyDimensions)
}
GameEngine.prototype.loadSpawns = function(d){
    for (var i = 0; i < d['items'].length;i++){
        self.spawns[d['items'][i].spawnid] = d['items'][i];
    }
    console.log('loaded ' + d['items'].length + ' Spawns from file');
}
GameEngine.prototype.loadBuffs = function(d){
    for (var i = 0; i < d['items'].length;i++){
        self.buffs[d['items'][i].buffid] = d['items'][i];
    }
    console.log('loaded ' + d['items'].length + ' Buffs from file');
}
GameEngine.prototype.loadFactions = function(d){
    for (var i = 0; i < d['items'].length;i++){
        self.buffs[d['items'][i].buffid] = d['items'][i];
    }
    console.log('loaded ' + d['items'].length + ' Buffs from file');
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

GameEngine.prototype.checkData = function(obj,key,type){
    if (typeof obj[key] == 'undefined'){
        console.log('INVALID DATA - ' + key + ' = undefined');
        console.log(obj);
        return false;
    }else if (typeof type != 'undefined'){
        if (typeof obj[key] != type){
            console.log('INVALID DATA - ' + key + ' != ' + type);
            console.log(obj);
            return false;
        }else{
            return true;
        }
    }else{
        return true;
    }
}

GameEngine.prototype.getItem = function(id){
    if (Utils._udCheck(this.items[id])){
        return false;
    }else{
        return this.items[id];
    }
}

GameEngine.prototype.getSlot = function (s) {
    if (typeof this.slotEnums[s] == 'undefined'){
        console.log("NO SLOT " + s);
        return 'none';
    }else{
        return this.slotEnums[s];
    }
};

GameEngine.prototype.getStat = function (s) {
    if (typeof this.statEnums[s] == 'undefined'){
        console.log("NO STAT " + s);
        return 'none';
    }else{
        return this.statEnums[s];
    }
};
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
        data[Enums.ID] = p.id;
        data[Enums.CLASSES] = {};
        for (var i in self.classes){
            data[Enums.CLASSES][i] = self.classes[i].getClientObj();
        }
        data[Enums.RACES] = {};
        for (var i in self.races){
            data[Enums.RACES][i] = self.races[i].getClientObj();
        }
        self.queuePlayer(p,Enums.CONNINFO, data);
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