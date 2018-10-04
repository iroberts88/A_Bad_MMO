//----------------------------------------------------------------
//zone.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    AWS = require("aws-sdk");

var Zone = function(ge) {

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
        var xStart = coords.x*20;
        var yStart = coords.y*20;
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
    console.log(this.mapid);
}

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

Zone.prototype.changeSector = function(p,arr,id,tile){
    //p = the player to change sector
    //arr = the coordinates of the sector change
    //id the id of the new sector
    if (arr[0] == 0 && arr[1] == 0){
        return;
    }
    var current = this.getSector(p.character.currentSector);
    if (current){
        current.removePlayer(p);
    }
    var newSector = this.getSector(id);
    if (newSector){
        newSector.addPlayer(p);
    }
    var newCoords = this.getSectorXY(id);
    var removeList = [];
    var addList = [];
    if (arr[0] == -1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x-1) + 'x' + (newCoords.y+i)));
            removeList.push(this.getSector((newCoords.x+2) + 'x' + (newCoords.y+i)));
        }
    }else if (arr[1] == -1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y-1)));
            removeList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y+2)));
        }
    }else if (arr[0] == 1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x+1) + 'x' + (newCoords.y+i)));
            removeList.push(this.getSector((newCoords.x-2) + 'x' + (newCoords.y+i)));
        }
    }else if (arr[1] == 1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y+1)));
            removeList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y-2)));
        }
    }
    for (var i = 0; i < addList.length;i++){
        try{
            if (addList[i] == null){continue;}
            for (var pl in addList[i].players){
                var player = addList[i].players[pl];
                this.engine.queuePlayer(player,'addPC',{
                    id: p.id,
                    name:p.user.userData.username,
                    user: p.user.userData.username,
                    owSprite: p.character.owSprite,
                    tile: [tile.x,tile.y],
                    sector: id
                });
                this.engine.queuePlayer(p,'addPC',{
                    id: player.id,
                    user: player.user.userData.username,
                    name:player.user.userData.username,
                    owSprite: player.character.owSprite,
                    tile: player.character.currentTile,
                    sector: player.character.currentSector
                });
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
                this.engine.queuePlayer(player,'removePC',{id: p.id})
                this.engine.queuePlayer(p,'removePC',{id: player.id})
            }
        }catch(e){
            console.log(e);
        }
    }
}

Zone.prototype.getSector = function(id){
    if (typeof this.map[id] != 'undefined'){
        return this.map[id];
    }else{
        return null;
    }
}
Zone.prototype.getPlayers = function(sector){
    var players = [];
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            if (typeof this.map[(sector.sectorX+i) + 'x' + (sector.sectorY+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.map[(sector.sectorX+i) + 'x' + (sector.sectorY+j)].players){
                var player = this.map[(sector.sectorX+i) + 'x' + (sector.sectorY+j)].players[pl];
                players.push({
                    id: player.id,
                    user: player.user.userData.username,
                    name:player.user.userData.username,
                    owSprite: player.character.owSprite,
                    tile: player.character.currentTile,
                    sector: player.character.currentSector
                })
            }
        }
    }
    return players;
}
Zone.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    //TODO add player to all players in the zone within 1 sector
    this.map[p.character.currentSector].addPlayer(p);
    this.playerCount += 1;
    var coords = this.getSectorXY(p.character.currentSector);
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            if (typeof this.map[(coords.x+i) + 'x' + (coords.y+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                var player = this.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                this.engine.queuePlayer(player,'addPC',{
                    id: p.id,
                    name:p.user.userData.username,
                    user: p.user.userData.username,
                    owSprite: p.character.owSprite,
                    tile: p.character.currentTile,
                    sector: p.character.currentSector
                });
            }
        }
    }
    return this.playerCount;
}

Zone.prototype.removePlayer = function(p){
    this.map[p.character.currentSector].removePlayer(p);
    //TODO remove player from all players in the zone within 1 sector
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            var coords = this.getSectorXY(p.character.currentSector);
            if (typeof this.map[(coords.x+i) + 'x' + (coords.y+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                var player = this.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                this.engine.queuePlayer(player,'removePC',{id: p.id})
            }
        }
    }
    delete this.players[p.id];
    this.playerCount -= 1;
    return this.playerCount;
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
    this.sectorX = coords.x;
    this.sectorY = coords.y;
};

Sector.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
};

Sector.prototype.removePlayer = function(p){
    delete this.players[p.id];
    this.playerCount -= 1;
};

exports.Sector = Sector;

var Tile = function(x,y,data,zone) {
    this.x = x;
    this.y = y;
    this.zone = zone;
    this.triggers = Utils.udCheck(data[zone.engine.enums.TRIGGERS],[],data[zone.engine.enums.TRIGGERS]);
    this.resource = Utils.udCheck(data[zone.engine.enums.RESOURCE],[],data[zone.engine.enums.RESOURCE]);
    this.overlayResource = Utils.udCheck(data[zone.engine.enums.OVERLAYRESOURCE],[],data[zone.engine.enums.OVERLAYRESOURCE]);
    this.open = Utils.udCheck(data[zone.engine.enums.OPEN],[],data[zone.engine.enums.OPEN]);
};

exports.Tile = Tile;