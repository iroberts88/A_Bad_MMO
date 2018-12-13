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

        AC: 'ac',
        ACQUIRETARGET: 'acquireTargetasdf',
        ADDCHARACTER: 'addcharacter',
        ADDITEM: 'addItem',
        ADDPC: 'addPC',
        ADDNPC: 'addNPC',
        AGILITY: 'agility',
        ALL: 'all',
        AMMO: 'ammo',
        ARCANERES: 'arcaneRes',
        ARMS: 'arms',
        ATTRIBUTES: 'attribute',
        AVAILABLECLASSES: 'availableClasse',

        BACK: 'back',
        BAG: 'bag',
        BAG1: 'bag1',
        BAG2: 'bag2',
        BAG3: 'bag3',
        BAG4: 'bag4',
        BAGSIZE: 'bagSize',
        BLUDGEON: 'bludgeon',
        BOOL: 'bool',

        CARRYWEIGHT: 'carryWeight',
        CHARACTERS: 'characters',
        CHARISMA: 'charisma',
        CHECKNAME: 'checkName',
        CHEST: 'chest',
        CLIENTCOMMAND: 'clientCommand',
        CLASSES: 'classes',
        CLASS: 'class',
        CLASSID: 'classi',
        COMBATBEHAVIOUR: 'combatBehaviourfdsa',
        COMMAND: 'command',
        CONNINFO: 'connInfo',
        COPPER: 'copper',
        CREATECHAR: 'CreateChar',
        CREATECHARERROR: 'createCharError',
        CURRENTENERGY: 'currentEnergy',
        CURRENTEXP: 'currentExp',
        CURRENTHEALTH: 'currentHealth',
        CURRENTMANA: 'currentMana',
        CURRENTWEIGHT: 'currentWeight',

        DESCRIPTION: 'descriptio',
        DEXTERITY: 'dexterity',
        DISEASERES: 'diseaseRes',
        DWARF: 'dwarf',

        EAR1: 'ear1',
        EAR2: 'ear2',
        EARTHRES: 'earthRes',
        ELF: 'elf',
        ENTERGAME: 'entergame',
        EQUIPITEM: 'equipItem',

        FACE: 'face',
        FEET: 'feet',
        FIGHTER: 'fighter',
        FINGER1: 'finger1',
        FINGER2: 'finger2',
        FIRERES: 'fireRes',
        FLAVORTEXT: 'flavorText',
        FLIPPED: 'flipped',
        FROSTRES: 'frostRes',

        GETINVENTORY: 'getInventory',
        GNOME: 'gnome',
        GOLD: 'gold',
        GRID: 'grid',

        HANDS: 'hands',
        HEAD: 'head',
        HEALINGPOWER: 'healingPower',
        HOLYRES: 'holyres',
        HUMAN: 'human',

        ID: 'id',
        IDLEBEHAVIOUR: 'idleBehaviourfdsa',
        INTELLIGENCE: 'intelligence',
        ITEM: 'item',
        ITEMID: 'itemid',
        ITEMS: 'items',

        JUMPSPEED: 'jumpSpeed',
        JUMPTIME: 'jumpTime',

        LEGS: 'legs',
        LEVEL: 'level',
        LOGINATTEMPT: 'loginAttempt',
        LOGOUT: 'logout',
        LOGGEDIN: 'loggedIn',
        LORE: 'lore',
        LUCK: 'luck',

        MAGE: 'mage',
        MAGIC: 'magic',
        MAIN: 'main',
        MAPDATA: 'mapDat',
        MAPNAME: 'mapidfdsaf',
        MAXENERGY: 'maxEnergy',
        MAXHEALTH: 'maxHealth',
        MAXMANA: 'maxMana',
        MESSAGE: 'message',
        MESSAGETYPE: 'messageType',
        MELEEPOWER: 'meleePower',
        MOD: 'mod', //is a stat modded or base
        MOVE: 'move',
        MOVEITEM: 'moveItem',
        MOVEVECTOR: 'moveVector',

        NAME: 'nam',
        NECK: 'neck',
        NEWMAP: 'newmap',
        NPCS: 'NPCS',

        ONEQUIPTEXT: 'onEquipText',
        OPEN: 'openfds',
        OVERLAYRESOURCE: 'overlayResourcefds',
        OVERLAYTYPE: 'oType',
        OWNER: 'owner',

        PERCEPTION: 'perception',
        PIERCE: 'pierce',
        PLATINUM: 'platinum',
        PLAYERS: 'players',
        PLAYERUPDATE: 'playerUpdate',
        POISONRES: 'poisonRes',
        POSITION: 'position',
        POSUPDATE: 'posUpdate',

        QUANTITY: 'quantity',

        RACE: 'race',
        RACEID: 'racei',
        RACES: 'races',
        RANGE: 'range',
        RANGED: 'ranged',
        RANGEDPOWER: 'rangedPower',
        REMOVEITEM: 'removeItem',
        REMOVEPC: 'removePC',
        REMOVENPC: 'removeNPC',
        RESOURCE: 'resource',

        SAY: 'say',
        SCALE: 'scale',
        SECONDARY: 'secondary',
        SECTORARRAY: 'sectorArr',
        SETITEMQUANTITY: 'setItemQuantity',
        SETLOGINERRORTEXT: 'setLoginErrorText',
        SETUNITSTAT: 'setUnitStat',
        SHADOWRES: 'shadowres',
        SHOCKRES: 'shockRes',
        SHOULDERS: 'shoulders',
        SHOUT: 'shout',
        SILVER: 'silver',
        SIZE: 'size',
        SLASH: 'slash',
        SLOT: 'slot',
        SLOTS: 'slots',
        SPAWNID: 'spawnID',
        SPELLPOWER: 'spellPower',
        SPEED: 'speed',
        STACK: 'stack',
        STAT: 'stat',
        STATS: 'stats',
        STAMINA: 'stamina',
        STRENGTH: 'strength',

        TEXT: 'text',
        THIEF: 'thief',
        TILES: 'tifdsafd',
        TRIGGERS: 'triggerfdsaf',
        TRINKET1: 'trinket1',
        TRINKET2: 'trinket2',
        TWOHANDED: 'twoHanded',

        UNIT: 'unit',
        UNEQUIPITEM: 'unequipItem',
        
        VALUE: 'value',

        WAIST: 'waist',
        WEIGHT: 'weight',
        WHISPER: 'whisper',
        WINDRES: 'windRes',
        WISDOM: 'wisdom',
        WRIST1: 'wrist1',
        WRIST2: 'wrist2',

        X: 'x',

        Y: 'y',

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

    this.slotEnums2 = {};
    this.slotEnums2[this.enums.HEAD] = 'head';

    this.slotEnums2[this.enums.EAR1] = 'ear';
    this.slotEnums2[this.enums.EAR2] = 'ear';
    this.slotEnums2[this.enums.HEAD] = 'head';
    this.slotEnums2[this.enums.FACE] = 'face';
    this.slotEnums2[this.enums.NECK] = 'neck';
    this.slotEnums2[this.enums.ARMS] = 'arms';
    this.slotEnums2[this.enums.BACK] = 'back';
    this.slotEnums2[this.enums.SHOULDERS] = 'shoulders';
    this.slotEnums2[this.enums.CHEST] = 'chest';
    this.slotEnums2[this.enums.WRIST1] = 'wrist';
    this.slotEnums2[this.enums.WRIST2] = 'wrist';
    this.slotEnums2[this.enums.HANDS] = 'hands';
    this.slotEnums2[this.enums.FINGER1] = 'finger';
    this.slotEnums2[this.enums.FINGER2] = 'finger';
    this.slotEnums2[this.enums.WAIST] = 'waist';
    this.slotEnums2[this.enums.LEGS] = 'legs';
    this.slotEnums2[this.enums.FEET] = 'feet';
    this.slotEnums2[this.enums.TRINKET1] = 'trinket';
    this.slotEnums2[this.enums.TRINKET2] = 'trinket';
    this.slotEnums2[this.enums.MAIN] = 'main';
    this.slotEnums2[this.enums.SECONDARY] = 'secondary';
    this.slotEnums2[this.enums.RANGED] = 'ranged';
    this.slotEnums2[this.enums.AMMO] = 'ammo';
    this.slotEnums2[this.enums.BAG1] = 'bag';
    this.slotEnums2[this.enums.BAG2] = 'bag';
    this.slotEnums2[this.enums.BAG3] = 'bag';
    this.slotEnums2[this.enums.BAG4] = 'bag';

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