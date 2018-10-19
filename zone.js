//----------------------------------------------------------------
//zone.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    fs = require('fs'),
    AWS = require("aws-sdk");

var Zone = function(ge) {
    this.TILE_SIZE = 48;
    this.SECTOR_SIZE = this.TILE_SIZE*21;
    this.engine = ge;

    //map info
    this.mapid = null;
    this.map = {}; //contains all tiles
    this.sectors = {}; //all sectors

    this.players = {}; //players in this zone
    this.playerCount = 0;

    this.zoneData = null;


}

Zone.prototype.init = function (data) {
    //initialize the map here
    this.mapid = data[this.engine.enums.MAPID];
    for (var i = 0; i < data[this.engine.enums.SECTORARRAY].length;i++){
        //create a new sector
        var id = data[this.engine.enums.SECTORARRAY][i];
        var sector = new Sector(id,this)
        this.sectors[id] = sector;
        //add all of the tiles in this sector to map
        var tiles = this.engine.enums.TILES;
        var mapData = this.engine.enums.MAPDATA;
        var coords = this.getSectorXY(id);
        var xStart = coords.x*21;
        var yStart = coords.y*21;
        for (var j = 0; j < data[mapData][id][tiles].length;j++){
            for (var k = 0; k < data[mapData][id][tiles][j].length;k++){
                var newTile = new Tile(k+xStart,j+yStart,data[mapData][id][tiles][j][k],this);
                if (Utils._udCheck(this.map[k+xStart])){
                    this.map[k+xStart] = {};
                }
                this.map[k+xStart][j+yStart] = newTile;
            }
        }
    }
};

Zone.prototype.tick = function(deltaTime) {
};

Zone.prototype.getSectorXY = function(string){
    var x = '';
    var y = '';
    var coords = {};
    var onX = true;
    for (var i = 0; i < string.length;i++){
        if (string.charAt(i) == 'x'){
            onX = false;
            continue;
        }
        if (onX){
            x = x + string.charAt(i);
        }else{
            y = y + string.charAt(i);
        }
    }
    coords.x = parseInt(x);
    coords.y = parseInt(y);
    return coords;
};

// ----------------------------------------------------------
// Player Functions
// ----------------------------------------------------------

Zone.prototype.collideUnit = function(unit,dt){
    var xDist = unit.moveVector.x*unit.speed.value*dt;
    var yDist = unit.moveVector.y*unit.speed.value*dt;
    var hyp = Math.sqrt((xDist*xDist) + (yDist*yDist));
    for (var i = 0; i < hyp;i++){
        unit.hb.pos.x += xDist/hyp;
        if (!this.getTile((unit.hb.pos.x+unit.cRadius*unit.moveVector.x),(unit.hb.pos.y+unit.cRadius*unit.moveVector.y))){
            unit.hb.pos.x -= xDist/hyp;
        }
        unit.hb.pos.y += yDist/hyp;
        if (!this.getTileOpen((unit.hb.pos.x+unit.cRadius*unit.moveVector.x),(unit.hb.pos.y+unit.cRadius*unit.moveVector.y))){
            unit.hb.pos.y -= yDist/hyp;
        }
    }
};
Zone.prototype.changeSector = function(p,sector){
    //p = the player to change sector
    var current = p.currentSector;
    if (current){
        current.removePlayer(p);
    }
    var newSector = this.getSector(p.hb.pos.x,p.hb.pos.y);
    if (newSector){
        newSector.addPlayer(p);
    }

    var arr = [newSector.x-current.x,newSector.y-current.y];
    var removeList = [];
    var addList = [];
    if (arr[0] == -1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSectorById((newSector.x-1) + 'x' + (newSector.y+i)));
            removeList.push(this.getSectorById((newSector.x+2) + 'x' + (newSector.y+i)));
        }
        if (arr[1] == 1){
            removeList.push(this.getSectorById((newSector.x+2) + 'x' + (newSector.y-2)));
        }
        if (arr[1] == -1){
            removeList.push(this.getSectorById((newSector.x+2) + 'x' + (newSector.y+2)));
        }
    }
    if (arr[0] == 1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSectorById((newSector.x+1) + 'x' + (newSector.y+i)));
            removeList.push(this.getSectorById((newSector.x-2) + 'x' + (newSector.y+i)));
        }
        if (arr[1] == 1){
            removeList.push(this.getSectorById((newSector.x-2) + 'x' + (newSector.y-2)));
        }
        if (arr[1] == -1){
            removeList.push(this.getSectorById((newSector.x-2) + 'x' + (newSector.y+2)));
        }
    }
    if (arr[1] == -1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSectorById((newSector.x+i) + 'x' + (newSector.y-1)));
            removeList.push(this.getSectorById((newSector.x+i) + 'x' + (newSector.y+2)));
        }
    }
    if (arr[1] == 1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSectorById((newSector.x+i) + 'x' + (newSector.y+1)));
            removeList.push(this.getSectorById((newSector.x+i) + 'x' + (newSector.y-2)));
        }
    }
    for (var i = 0; i < addList.length;i++){
        try{
            if (addList[i] == null){continue;}
            for (var pl in addList[i].players){
                var player = addList[i].players[pl];
                this.engine.queuePlayer(player.owner,this.engine.enums.ADDPC,p.getLessClientData());
                this.engine.queuePlayer(p.owner,this.engine.enums.ADDPC,player.getLessClientData());
            }
        }catch(e){
            console.log(e);
        }
    }
    for (var i = 0; i < removeList.length;i++){
        try{
            if (removeList[i] == null){continue;}
            for (var pl in removeList[i].players){
                var player = removeList[i].players[pl];
                console.log('derp' + player.id)
                var d = {};
                d[this.engine.enums.ID] = p.id;
                this.engine.queuePlayer(player.owner,this.engine.enums.REMOVEPC,d);
                var d = {};
                d[this.engine.enums.ID] = player.id;
                this.engine.queuePlayer(p.owner,this.engine.enums.REMOVEPC,d);
            }
        }catch(e){
            console.log(e);
        }
    }
    //get the new list of players to update for each player in the old sectors
    for (var i = 0; i < p.pToUpdate.length;i++){
        p.pToUpdate[i].pToUpdate = this.getPlayers(p.pToUpdate[i].currentSector);
    }
    //set the new pToUpdate
    p.pToUpdate = this.getPlayers(p.currentSector);
}

Zone.prototype.getSector = function(x,y){
    //get sector by position
    if (typeof this.sectors[Math.floor(x/this.SECTOR_SIZE)+'x'+Math.floor(y/this.SECTOR_SIZE)] != 'undefined'){
        return this.sectors[Math.floor(x/this.SECTOR_SIZE)+'x'+Math.floor(y/this.SECTOR_SIZE)];
    }else{
        return null;
    }
}

Zone.prototype.getTile = function(x,y){
    //get sector by position
    if (typeof this.map[Math.floor(x/this.TILE_SIZE)+'x'+Math.floor(y/this.TILE_SIZE)] != 'undefined'){
        return this.map[Math.floor(x/this.TILE_SIZE)+'x'+Math.floor(y/this.TILE_SIZE)];
    }else{
        return null;
    }
}
Zone.prototype.getTileOpen = function(x,y){
    //get sector by position
    if (typeof this.map[Math.floor(x/this.TILE_SIZE)+'x'+Math.floor(y/this.TILE_SIZE)] != 'undefined'){
        return this.map[Math.floor(x/this.TILE_SIZE)+'x'+Math.floor(y/this.TILE_SIZE)].open;
    }else{
        return false;
    }
}
Zone.prototype.getSectorById = function(id){
    if (typeof this.sectors[id] != 'undefined'){
        return this.sectors[id];
    }else{
        return null;
    }
}

Zone.prototype.getPlayers = function(sector){
    var players = [];
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            if (typeof this.sectors[(sector.x+i) + 'x' + (sector.y+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.sectors[(sector.x+i) + 'x' + (sector.y+j)].players){
                var player = this.sectors[(sector.x+i) + 'x' + (sector.y+j)].players[pl];
                players.push(player);
            }
        }
    }
    return players;
}

Zone.prototype.getPlayerData = function(sector){
    var pArr = [];
    var players = this.getPlayers(sector);
    for (var i = 0; i < players.length;i++){
        pArr.push(players[i].getLessClientData());
    }
    return pArr;
}

Zone.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    p.currentZone = this;
    var sector = this.getSector(p.hb.pos.x,p.hb.pos.y);
    var players = this.getPlayers(sector);
    for (var i = 0; i < players.length;i++){
        this.engine.queuePlayer(players[i].owner,this.engine.enums.ADDPC,p.getLessClientData());
        players[i].pToUpdate.push(p);
    }
    this.sendMapDataTo(p);
    sector.addPlayer(p);
    this.playerCount += 1;
    p.pToUpdate = this.getPlayers(p.currentSector);
    return this.playerCount;
}

Zone.prototype.removePlayer = function(p){
    var cid = p.currentSector.id;
    p.currentSector.removePlayer(p);
    var players = this.getPlayers(this.sectors[cid]);
    for (var i = 0; i < players.length;i++){
        var data = {};
        data[this.engine.enums.ID] = p.id;
        players[i].pToUpdate = players;
        this.engine.queuePlayer(players[i].owner,this.engine.enums.REMOVEPC,data);
    }
    delete this.players[p.id];
    this.playerCount -= 1;
    return this.playerCount;
}

Zone.prototype.sendMapDataTo = function(character) {
    var that = this;
    fs.readFile('./mapgen_tool/maps/' + that.mapid + '.json', "utf8",function read(err, fsdata) {
        if (err) {
            throw err;
        }
        //TODO also get NPC's
        var data = {}
        data[that.engine.enums.PLAYERS] = that.getPlayerData(character.currentSector);
        data[that.engine.enums.MAPDATA] = JSON.parse(fsdata);
        that.engine.queuePlayer(character.owner,that.engine.enums.NEWMAP,data);
    });
}

// ----------------------------------------------------------
// Sector Functions
// ----------------------------------------------------------

exports.Zone = Zone;


//Sector
var Sector = function(id,zone) {
    this.players = {}; //players in this zone
    this.playerCount = 0; //players in this sector
    this.id = id;
    this.zone = zone;
    var coords = this.zone.getSectorXY(this.id);
    this.x = coords.x;
    this.y = coords.y;
};

Sector.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    p.currentSector = this;
    this.playerCount += 1;
};

Sector.prototype.removePlayer = function(p){
    p.currentSector = null;
    delete this.players[p.id];
    this.playerCount -= 1;
};

exports.Sector = Sector;

var Tile = function(x,y,data,zone) {
    this.x = x;
    this.y = y;
    this.zone = zone;
    this.triggers = Utils.udCheck(data[zone.engine.enums.TRIGGERS],[],data[zone.engine.enums.TRIGGERS]);
    this.resource = Utils.udCheck(data[zone.engine.enums.RESOURCE],'0x0',data[zone.engine.enums.RESOURCE]);
    this.overlayResource = Utils.udCheck(data[zone.engine.enums.OVERLAYRESOURCE],'0x0',data[zone.engine.enums.OVERLAYRESOURCE]);
    this.open = Utils.udCheck(data[zone.engine.enums.OPEN],true,data[zone.engine.enums.OPEN]);
};

exports.Tile = Tile;