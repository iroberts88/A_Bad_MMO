//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Zone = require('./zone.js').Zone,
    Race = require('./race.js').Race,
    CharClass = require('./charclass.js').CharClass,
    Inventory = require('./inventory.js').Inventory,
    PlayerItem = require('./inventory.js').PlayerItem,
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
    this.buffs = {};
    this.spawns = {};
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
        //TODO change to just numbers...
        MAPDATA: 'mapDat',
        CLASSID: 'classi',
        DESCRIPTION: 'descriptio',
        NAME: 'nam',
        ATTRIBUTES: 'attribute',
        AVAILABLECLASSES: 'availableClasse',
        RACEID: 'racei',
        RESOURCE: 'resourc',
        SECTORARRAY: 'sectorArr',
        TILES: 'tifdsafd',
        TRIGGERS: 'triggerfdsaf',
        MAPNAME: 'mapidfdsaf',


        OPEN: 'openfds',
        OVERLAYRESOURCE: 'overlayResourcefds',
        IDLEBEHAVIOUR: 'idleBehaviourfdsa',
        COMBATBEHAVIOUR: 'combatBehaviourfdsa',
        ACQUIRETARGET: 'acquireTargetasdf',

        //ITEM/Inventory enums
        ITEM: 'item',
        ITEMS: 'items',
        ADDITEM: 'addItem',
        REMOVEITEM: 'removeItem',
        SETITEMQUANTITY: 'setItemQuantity',
        FLIPPED: 'flipped',
        LORE: 'lore',
        RESOURCE: 'resource',
        VALUE: 'value',
        WEIGHT: 'weight',
        FLAVORTEXT: 'flavorText',
        SLOTS: 'slots',
        PIERCE: 'pierce',
        SLASH: 'slash',
        BLUDGEON: 'bludgeon',
        RANGE: 'range',
        ONEQUIPTEXT: 'onEquipText',
        STATS: 'stats',
        QUANTITY: 'quantity',

        EAR1: 'ear1',
        EAR2: 'ear2',
        HEAD: 'head',
        FACE: 'face',
        NECK: 'neck',
        ARMS: 'arms',
        BACK: 'back',
        SHOULDERS: 'shoulders',
        CHEST: 'chest',
        WRIST1: 'wrist1',
        WRIST2: 'wrist2',
        HANDS: 'hands',
        FINGER1: 'finger1',
        FINGER2: 'finger2',
        WAIST: 'waist',
        LEGS: 'legs',
        FEET: 'feet',
        TRINKET1: 'trinket1',
        TRINKET2: 'trinket2',
        MAIN: 'main',
        RANGED: 'ranged',
        AMMO: 'ammo',
        SECONDARY: 'secondary',
        AMMO: 'ammo',
        BAG: 'bag',
        BAG1: 'bag1',
        BAG2: 'bag2',
        BAG3: 'bag3',
        BAG4: 'bag4',

        AC: 'ac',
        AGILITY: 'agility',
        ARCANERES: 'arcaneRes',
        CHARISMA: 'charisma',
        ADDCHARACTER: 'addcharacter',
        CURRENTHEALTH: 'currentHealth',
        DEXTERITY: 'dexterity',
        DISEASERES: 'diseaseRes',
        EARTHRES: 'earthRes',
        FIRERES: 'fireRes',
        FROSTRES: 'frostRes',
        HOLYRES: 'holyres',
        LUCK: 'luck',
        MAXENERGY: 'maxEnergy',
        MAXHEALTH: 'maxHealth',
        MAXMANA: 'maxMana',
        CURRENTENERGY: 'currentEnergy',
        CURRENTEXP: 'currentExp',
        CURRENTMANA: 'currentMana',
        POISONRES: 'poisonRes',
        PERCEPTION: 'perception',
        RANGEDPOWER: 'rangedPower',
        MELEEPOWER: 'meleePower',
        SPELLPOWER: 'spellPower',
        HEALINGPOWER: 'healingPower',
        SHADOWRES: 'shadowres',
        SHOCKRES: 'shockRes',
        SPEED: 'speed',
        STRENGTH: 'strength',
        STAMINA: 'stamina',
        WINDRES: 'windRes',
        WISDOM: 'wisdom',

        ADDPC: 'addPC',
        ADDNPC: 'addNPC',
        BOOL: 'bool',
        CARRYWEIGHT: 'carryWeight',
        CHARACTERS: 'characters',
        CHECKNAME: 'checkName',
        CLIENTCOMMAND: 'clientCommand',
        CLASSES: 'classes',
        CLASS: 'class',
        COMMAND: 'command',
        CONNINFO: 'connInfo',
        CREATECHAR: 'CreateChar',
        CREATECHARERROR: 'createCharError',
        CURRENTWEIGHT: 'currentWeight',
        ENTERGAME: 'entergame',
        GETINVENTORY: 'getInventory',
        ID: 'id',
        INTELLIGENCE: 'intelligence',
        JUMPSPEED: 'jumpSpeed',
        JUMPTIME: 'jumpTime',
        LEVEL: 'level',
        LOGINATTEMPT: 'loginAttempt',
        LOGOUT: 'logout',
        LOGGEDIN: 'loggedIn',
        MESSAGE: 'message',
        MESSAGETYPE: 'messageType',
        MOVE: 'move',
        MOVEVECTOR: 'moveVector',
        NEWMAP: 'newmap',
        NPCS: 'NPCS',

        OWNER: 'owner',
        PLAYERS: 'players',
        PLAYERUPDATE: 'playerUpdate',
        POSITION: 'position',
        POSUPDATE: 'posUpdate',
        RACES: 'races',
        RACE: 'race',
        REMOVEPC: 'removePC',
        REMOVENPC: 'removeNPC',
        SAY: 'say',
        SETLOGINERRORTEXT: 'setLoginErrorText',
        SPAWNID: 'spawnID',
        SHOUT: 'shout',
        SLOT: 'slot',
        TEXT: 'text',
        WHISPER: 'whisper',
        ZONE: 'zone'
    };
    this.slotEnums = {
        'ear': this.enums.EAR,
        'head': this.enums.HEAD,
        'face': this.enums.FACE,
        'neck': this.enums.NECK,
        'arms': this.enums.ARMS,
        'back': this.enums.BACK,
        'shoulders': this.enums.SHOULDERS,
        'chest': this.enums.CHEST,
        'wrist': this.enums.WRIST,
        'hands': this.enums.HANDS,
        'finger': this.enums.FINGER,
        'waist': this.enums.WAIST,
        'legs': this.enums.LEGS,
        'feet': this.enums.FEET,
        'trinket': this.enums.TRINKET,
        'main': this.enums.MAIN,
        'secondary': this.enums.SECONDARY,
        'ranged': this.enums.RANGED,
        'ammo': this.enums.AMMO,
        'bag': this.enums.BAG,
    };

    this.statEnums = {
        'strength': this.enums.STRENGTH,
        'stamina': this.enums.STAMINA,
        'agility': this.enums.AGILITY,
        'dexterity': this.enums.DEXTERITY,
        'intelligence': this.enums.INTELLIGENCE,
        'wisdom': this.enums.WISDOM,
        'charisma': this.enums.CHARISMA,
        'perception': this.enums.PERCEPTION,
        'luck': this.enums.LUCK,
        'ac': this.enums.AC,
        'maxHealth': this.enums.MAXHEALTH
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

GameEngine.prototype.loadItems = function(arr){
    for (var i = 0; i < arr.length;i++){
        var item = new Item(self);
        item.init(arr[i]);
        self.items[arr[i].itemid] = item;
    }
    console.log('loaded ' + arr.length + ' Classes from file');
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

GameEngine.prototype.loadEnemies = function(arr){
    for (var i = 0; i < arr.length;i++){
        self.enemies[arr[i].enemyid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Enemies from file');
}
GameEngine.prototype.loadSpawns = function(arr){
    for (var i = 0; i < arr.length;i++){
        self.spawns[arr[i].spawnid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Spawns from file');
}
GameEngine.prototype.loadBuffs = function(arr){
    for (var i = 0; i < arr.length;i++){
        self.buffs[arr[i].buffid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Buffs from file');
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