//----------------------------------------------------------------
//zone.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    NPC = require('./npc.js').NPC,
    Character = require('./character.js').Character,
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    fs = require('fs'),
    AWS = require("aws-sdk"),
    SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1

var P = SAT.Polygon,
    V = SAT.Vector,
    C = SAT.Circle,
    B = SAT.Box,
    R = SAT.Response;

var Zone = function(ge) {
    this.TILE_SIZE = 48;
    this.SECTOR_SIZE = this.TILE_SIZE*21;
    this.engine = ge;

    //TODO delete
    this.test = 0;

    //map info
    this.mapid = null;
    this.map = {}; //contains all tiles
    this.sectors = {}; //all sectors

    this.spawns = {};

    this.npcs = {};

    this.players = {}; //players in this zone
    this.playerCount = 0;

    this.zoneData = null;

    this.sayDistance = 750;
    this.shoutDistance = 2000;
    this.whisperDistance = 150;
    this.mapData = null;

    this.cResponse = new R();

    this.tileHitBox = new B(new V(0,0),this.TILE_SIZE,this.TILE_SIZE).toPolygon();
}

Zone.prototype.init = function (data) {
    //initialize the map here
    this.mapid = data.mapid;
    for (var i = 0; i < data.sectorArray.length;i++){
        //create a new sector
        var id = data.sectorArray[i];
        var sector = new Sector(id,this)
        this.sectors[id] = sector;
        //add all of the tiles in this sector to map
        var coords = this.getSectorXY(id);
        var xStart = coords.x*21;
        var yStart = coords.y*21;
        for (var j = 0; j < data.mapData[id].tiles.length;j++){
            for (var k = 0; k < data.mapData[id].tiles[j].length;k++){
                var newTile = new Tile(j+xStart,k+yStart,data.mapData[id].tiles[j][k],this);
                if (Utils._udCheck(this.map[k+xStart])){
                    this.map[k+xStart] = {};
                }
                this.map[j+xStart][k+yStart] = newTile;
            }
        }
    }
    this.mapData = {};
    this.mapData[this.engine.enums.MAPDATA] = {};
    this.mapData[this.engine.enums.MAPNAME] = data.mapname;
    for (var i in data.mapData){
        this.mapData[this.engine.enums.MAPDATA][i] = {};
        this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES] = [];
        for (var j = 0; j < data.mapData[i].tiles.length;j++){
            this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j] = [];
            for (var k = 0; k < data.mapData[i].tiles[j].length;k++){
                this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j][k] = {};
                if (!Utils._udCheck(data.mapData[i].tiles[j][k].resource)){
                    this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j][k][this.engine.enums.RESOURCE] = data.mapData[i].tiles[j][k].resource;
                }
                if (!Utils._udCheck(data.mapData[i].tiles[j][k].overlayResource)){
                    this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j][k][this.engine.enums.OVERLAYRESOURCE] = data.mapData[i].tiles[j][k].overlayResource;
                    this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j][k][this.engine.enums.OVERLAYTYPE] = data.mapData[i].tiles[j][k].oType;
                }
                if (!Utils._udCheck(data.mapData[i].tiles[j][k].open)){
                    this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j][k][this.engine.enums.OPEN] = data.mapData[i].tiles[j][k].open;
                }
                if (!Utils._udCheck(data.mapData[i].tiles[j][k].triggers)){
                    this.mapData[this.engine.enums.MAPDATA][i][this.engine.enums.TILES][j][k][this.engine.enums.TRIGGERS] = data.mapData[i].tiles[j][k].triggers;
                }
            }
        }
    }
};

Zone.prototype.tick = function(deltaTime) {
    for (var i in this.spawns){
        this.spawns[i].tick(deltaTime);
    }
    for (var i in this.npcs){
        this.npcs[i].update(deltaTime);
    }
};

Zone.prototype.say = function(p,text){
    var players = this.getPlayers(p.currentSector);
    var xDist = 0;
    var yDist = 0;
    var data = {};
    data[this.engine.enums.ID] = p.id;
    data[this.engine.enums.NAME] = p.name;
    data[this.engine.enums.MESSAGETYPE] = this.engine.enums.SAY;
    data[this.engine.enums.TEXT] = text;
    for (var i = 0; i <players.length;i++){
        xDist = Math.abs(players[i].hb.pos.x-p.hb.pos.x);
        yDist = Math.abs(players[i].hb.pos.y-p.hb.pos.y);
        if (Math.sqrt(xDist*xDist + yDist*yDist) < this.sayDistance){
            this.engine.queuePlayer(players[i].owner,this.engine.enums.MESSAGE,data);
        }
    }
}

Zone.prototype.whisper = function(p,text){
    var players = this.getPlayers(p.currentSector);
    var xDist = 0;
    var yDist = 0;
    var data = {};
    data[this.engine.enums.ID] = p.id;
    data[this.engine.enums.NAME] = p.name;
    data[this.engine.enums.MESSAGETYPE] = this.engine.enums.WHISPER;
    data[this.engine.enums.TEXT] = text;
    for (var i = 0; i <players.length;i++){
        xDist = Math.abs(players[i].hb.pos.x-p.hb.pos.x);
        yDist = Math.abs(players[i].hb.pos.y-p.hb.pos.y);
        if (Math.sqrt(xDist*xDist + yDist*yDist) < this.whisperDistance){
            this.engine.queuePlayer(players[i].owner,this.engine.enums.MESSAGE,data);
        }
    }
}
Zone.prototype.shout = function(p,text){
    var players = this.getPlayers(p.currentSector);
    var xDist = 0;
    var yDist = 0;
    var data = {};
    data[this.engine.enums.ID] = p.id;
    data[this.engine.enums.NAME] = p.name;
    data[this.engine.enums.MESSAGETYPE] = this.engine.enums.SHOUT;
    data[this.engine.enums.TEXT] = text;
    for (var i = 0; i <players.length;i++){
        xDist = Math.abs(players[i].hb.pos.x-p.hb.pos.x);
        yDist = Math.abs(players[i].hb.pos.y-p.hb.pos.y);
        if (Math.sqrt(xDist*xDist + yDist*yDist) < this.shoutDistance){
            this.engine.queuePlayer(players[i].owner,this.engine.enums.MESSAGE,data);
        }
    }
}
Zone.prototype.msg = function(p,text){
    var xDist = 0;
    var yDist = 0;
    var data = {};
    data[this.engine.enums.ID] = p.id;
    data[this.engine.enums.NAME] = p.name;
    data[this.engine.enums.MESSAGETYPE] = this.engine.enums.ZONE;
    data[this.engine.enums.TEXT] = text;
    for (var i in this.players){
        xDist = Math.abs(this.players[i].hb.pos.x-p.hb.pos.x);
        yDist = Math.abs(this.players[i].hb.pos.y-p.hb.pos.y);
        this.engine.queuePlayer(this.players[i].owner,this.engine.enums.MESSAGE,data);
    }
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

Zone.prototype.collideUnit = function(unit,dt){
    var xDist = unit.moveVector.x*unit.speed.value*dt;
    var yDist = unit.moveVector.y*unit.speed.value*dt;
    var hyp = Math.sqrt((xDist*xDist) + (yDist*yDist));
    var tile;
    for (var i = 1; i <= Math.ceil(hyp);i++){
        if (xDist){
            unit.hb.pos.x += xDist/Math.ceil(hyp);
            tile = this.getTile(unit.hb.pos.x+unit.cRadius*(xDist/Math.abs(xDist)),unit.hb.pos.y);
            if (tile){
                if (!tile.open){
                    this.tileHitBox.pos.x = tile.pos.x;
                    this.tileHitBox.pos.y = tile.pos.y;
                    if (SAT.testPolygonCircle(this.tileHitBox,unit.hb,this.cResponse)){
                        unit.hb.pos.x += this.cResponse.overlapV.x;
                        this.cResponse.clear();
                    }
                }
            }else{
                unit.hb.pos.x -= xDist/Math.ceil(hyp);
            }
        }
        this.cResponse.clear();
        if (yDist){
            unit.hb.pos.y += yDist/Math.ceil(hyp);
            tile = this.getTile(unit.hb.pos.x,unit.hb.pos.y+unit.cRadius*(yDist/Math.abs(yDist)));
            if (tile){
                if (!tile.open){
                    this.tileHitBox.pos.x = tile.pos.x;
                    this.tileHitBox.pos.y = tile.pos.y;
                    if (SAT.testPolygonCircle(this.tileHitBox,unit.hb,this.cResponse)){
                        unit.hb.pos.y += this.cResponse.overlapV.y;
                        this.cResponse.clear();
                    }
                }
            }else{
                unit.hb.pos.y -= yDist/Math.ceil(hyp);
            }
        }
    }
};
Zone.prototype.checkPathBlocked = function(u1,u2){
    var mVec = new V(u2.hb.pos.x-u1.hb.pos.x,u2.hb.pos.y-u1.hb.pos.y);
    if (u1.getTile() == u2.getTile()){
        return false;
    }
    var hyp = Math.sqrt((mVec.x*mVec.x) + (mVec.y*mVec.y));
    mVec.normalize();
    var tile;
    for (var i = 1; i <= Math.ceil(hyp/this.TILE_SIZE);i++){
        tile = this.getTile(u1.hb.pos.x+this.TILE_SIZE*mVec.x*i,u1.hb.pos.y+this.TILE_SIZE*mVec.y*i);
        if (!tile){return true;}
        if (!tile.open){
            return true;
        }
    }
    return false;
};
Zone.prototype.changeSector = function(p,sector){
    var isNPC = p.isEnemy;
    //p = the player or npc to change sector
    //change sectors
    //this will not update client
    var current = p.currentSector;
    if (current){
        if (isNPC){
            current.removeNPC(p);
        }else{
            current.removePlayer(p);
        }
    }
    var newSector = this.getSector(p.hb.pos.x,p.hb.pos.y);
    if (newSector){
        if (isNPC){
            newSector.addNPC(p);
        }else{
            newSector.addPlayer(p);
        }
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

    //update the client here
    for (var i = 0; i < addList.length;i++){
        try{
            if (addList[i] == null){continue;}
            for (var pl in addList[i].players){
                //every player in new sector, add new PC and NPC
                var player = addList[i].players[pl];
                if (isNPC){
                    this.engine.queuePlayer(player.owner,this.engine.enums.ADDNPC,p.getLessClientData());
                    continue;
                }
                this.engine.queuePlayer(player.owner,this.engine.enums.ADDPC,p.getLessClientData());
                this.engine.queuePlayer(p.owner,this.engine.enums.ADDPC,player.getLessClientData());
            }
            for (var n in addList[i].npcs){
                if (p != addList[i].npcs[n]){
                    addList[i].npcs[n].nearbyUnits[p.id] = p;
                    if (isNPC){
                        p.nearbyUnits[addList[i].npcs[n].id] = addList[i].npcs[n];
                    }
                }
            }
            if(!isNPC){
                for (var n in addList[i].npcs){
                    addList[i].npcs[n].pToUpdate[p.id] = p;
                    this.engine.queuePlayer(p.owner,this.engine.enums.ADDNPC,addList[i].npcs[n].getLessClientData());
                }
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
                var d = {};
                d[this.engine.enums.ID] = p.id;
                if (isNPC){
                    this.engine.queuePlayer(player.owner,this.engine.enums.REMOVENPC,d);
                    continue;
                }
                this.engine.queuePlayer(player.owner,this.engine.enums.REMOVEPC,d);
                var d = {};
                d[this.engine.enums.ID] = player.id;
                this.engine.queuePlayer(p.owner,this.engine.enums.REMOVEPC,d);
            }

            for (var n in removeList[i].npcs){
                delete removeList[i].npcs[n].nearbyUnits[p.id];
                if (isNPC){
                    delete p.nearbyUnits[removeList[i].npcs[n].id];
                }
            }
            if (!isNPC){
                for (var n in removeList[i].npcs){
                    if (typeof removeList[i].npcs[n].pToUpdate[p.id] != 'undefined'){
                        delete removeList[i].npcs[n].pToUpdate[p.id];
                    }
                    var d = {};
                    d[this.engine.enums.ID] = removeList[i].npcs[n].id;
                    this.engine.queuePlayer(p.owner,this.engine.enums.REMOVENPC,d);
                }
            }
        }catch(e){
            console.log(e);
        }
    }
    //get the new list of players to update for each player in the old sectors
    if (!isNPC){
        for (var i = 0; i < p.pToUpdate.length;i++){
            p.pToUpdate[i].getPToUpdate();
        }
    }
    //set the new pToUpdate
    p.getPToUpdate();
}

Zone.prototype.getSector = function(x,y){
    //console.log('Getting Sector At:   ' +  x + ', ' + y);
    //get sector by position
    if (typeof this.sectors[Math.floor(x/this.SECTOR_SIZE)+'x'+Math.floor(y/this.SECTOR_SIZE)] != 'undefined'){
        return this.sectors[Math.floor(x/this.SECTOR_SIZE)+'x'+Math.floor(y/this.SECTOR_SIZE)];
    }else{
        return null;
    }
}

Zone.prototype.getTile = function(x,y){
    //console.log('Getting Tile:   ' +  x + ', ' + y);
    //get sector by position
    if (typeof this.map[Math.floor(x/this.TILE_SIZE)][Math.floor(y/this.TILE_SIZE)] != 'undefined'){
        return this.map[Math.floor(x/this.TILE_SIZE)][Math.floor(y/this.TILE_SIZE)];
    }else{
        return null;
    }
}
Zone.prototype.getTileOpen = function(x,y){
    //get sector by position
    if (typeof this.map[Math.floor(x/this.TILE_SIZE)][Math.floor(y/this.TILE_SIZE)] != 'undefined'){
        return this.map[Math.floor(x/this.TILE_SIZE)][Math.floor(y/this.TILE_SIZE)].open;
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

Zone.prototype.getNPCS = function(sector){
    var npcs = [];
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            if (typeof this.sectors[(sector.x+i) + 'x' + (sector.y+j)] == 'undefined'){
                continue;
            }
            for (var n in this.sectors[(sector.x+i) + 'x' + (sector.y+j)].npcs){
                var npc = this.sectors[(sector.x+i) + 'x' + (sector.y+j)].npcs[n];
                npcs.push(npc);
            }
        }
    }
    return npcs;
}

Zone.prototype.getPlayerData = function(sector){
    var pArr = [];
    var players = this.getPlayers(sector);
    for (var i = 0; i < players.length;i++){
        pArr.push(players[i].getLessClientData());
    }
    return pArr;
}

Zone.prototype.getNPCData = function(sector){
    var nArr = [];
    var npcs = this.getNPCS(sector);
    for (var i = 0; i < npcs.length;i++){
        nArr.push(npcs[i].getLessClientData());
    }
    return nArr;
}

Zone.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    p.currentZone = this;
    var sector = this.getSector(p.hb.pos.x,p.hb.pos.y);
    var players = this.getPlayers(sector);
    var npcs = this.getNPCS(sector);
    for (var i = 0; i < players.length;i++){
        this.engine.queuePlayer(players[i].owner,this.engine.enums.ADDPC,p.getLessClientData());
        players[i].pToUpdate[p.id] = p;
    }
    for (var i = 0; i < npcs.length;i++){
        npcs[i].pToUpdate[p.id] = p;
        npcs[i].nearbyUnits[p.id] = p;
    }
    this.sendMapDataTo(p);
    sector.addPlayer(p);
    this.playerCount += 1;
    p.getPToUpdate();
    return this.playerCount;
}

Zone.prototype.removePlayer = function(p){
    var cid = p.currentSector.id;
    p.currentSector.removePlayer(p);
    var players = this.getPlayers(this.sectors[cid]);
    var npcs = this.getNPCS(this.sectors[cid]);
    for (var i = 0; i < players.length;i++){
        var data = {};
        data[this.engine.enums.ID] = p.id;
        if (players[i].pToUpdate[p.id]){
            delete players[i].pToUpdate[p.id];
        }
        this.engine.queuePlayer(players[i].owner,this.engine.enums.REMOVEPC,data);
    }
    for (var i = 0; i < npcs.length;i++){
        if (npcs[i].pToUpdate[p.id]){
            delete npcs[i].pToUpdate[p.id];
        }
        if (npcs[i].nearbyUnits[p.id]){
            delete npcs[i].nearbyUnits[p.id];
        }
    }
    delete this.players[p.id];
    this.playerCount -= 1;
    return this.playerCount;
}

Zone.prototype.addNPC = function(n){
    this.npcs[n.id] = n;
    n.currentZone = this;
    var sector = this.getSector(n.hb.pos.x,n.hb.pos.y);
    var players = this.getPlayers(sector);
    for (var i = 0; i < players.length;i++){
        this.engine.queuePlayer(players[i].owner,this.engine.enums.ADDNPC,n.getLessClientData());
    }
    sector.addNPC(n);
    n.getPToUpdate();
    n.getNearbyUnits();
    for (var i in n.nearbyUnits){
        //add npc to nearby npc's lists
        if (n.nearbyUnits[i].isEnemy){
            n.nearbyUnits[i].nearbyUnits[n.id] = n;
        }
    }
    return null;
}

Zone.prototype.removeNPC = function(n){
    var cid = n.currentSector.id; 
    n.currentSector.removeNPC(n);
    var players = this.getPlayers(this.sectors[cid]);
    for (var i in n.pToUpdate){
        var data = {};
        data[this.engine.enums.ID] = n.id;
        this.engine.queuePlayer(n.pToUpdate[i].owner,this.engine.enums.REMOVENPC,data);
    }
    //remove npc from nearby npc unit lists
    for (var i in n.nearbyUnits){
        if (n.nearbyUnits[i].isEnemy){
            if (n.nearbyUnits[i].nearbyUnits[n.id]){
                delete n.nearbyUnits[i].nearbyUnits[n.id];
            }
        }
    }
    delete this.npcs[n.id];
    return null;
}

Zone.prototype.getUnit = function(id){
    //get the unit with the given ID
    if (typeof this.players[id] != 'undefined'){
        return this.players[id];
    }
    if (typeof this.npcs[id] != 'undefined'){
        return this.npcs[id];
    }
    console.log('ERROR: no unit with id ' + id);
    return null;
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
        data[that.engine.enums.NPCS] = that.getNPCData(character.currentSector);
        data[that.engine.enums.MAPDATA] = that.mapData;
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
    this.npcs = {};
    this.playerCount = 0; //players in this sector
    this.id = id;
    this.zone = zone;
    var coords = this.zone.getSectorXY(this.id);
    this.x = coords.x;
    this.y = coords.y;
    
    this.pos = {
        x: this.x*zone.SECTOR_SIZE,
        y: this.y*zone.SECTOR_SIZE
    }
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
Sector.prototype.addNPC = function(n){
    this.npcs[n.id] = n;
    n.currentSector = this;
};

Sector.prototype.removeNPC = function(n){
    n.currentSector = null;
    delete this.npcs[n.id];
};

exports.Sector = Sector;

var Tile = function(x,y,data,zone) {
    this.x = x;
    this.y = y;
    this.pos = {
        x: this.x*zone.TILE_SIZE,
        y: this.y*zone.TILE_SIZE
    }
    this.center = {
        x: this.x*zone.TILE_SIZE + zone.TILE_SIZE/2,
        y: this.y*zone.TILE_SIZE + zone.TILE_SIZE/2
    }
    this.zone = zone;
    this.triggers = Utils.udCheck(data['triggers'],[],data['triggers']);
    this.resource = Utils.udCheck(data['resoure'],'0x0',data['resoure']);
    this.overlayResource = Utils.udCheck(data['overlayResoure'],'0x0',data['overlayResoure']);
    this.open = Utils.udCheck(data['open'],false,data['open']);
    if (!Utils._udCheck(zone.engine.spawns[data['spawnID']])){
        var id = zone.engine.getId();
        zone.spawns[id] = new Spawn(zone.engine.spawns[data['spawnID']],this);
        zone.spawns[id].spawnid = id;
        this.spawn = id;
    }
    this.searchInit();
};

Tile.prototype.searchInit = function(){
    //initialize tile for A* searching
    this.f = 0;
    this.h = 0;
    this.g = 0;
    this.parent = null;
};

Tile.prototype.print = function(){
    console.log(this.x + ', ' + this.y)
};

exports.Tile = Tile;

var Spawn = function(data,tile) {
    this.spawnid = null;
    this.tile = tile;
    this.zone = tile.zone;
    this.engine = tile.zone.engine;
    this.t = data['t'];
    this.def = data['def']; //default enemy spawn
    this.enemies = data['enemies'];
    this.chances = data['chances'];

    this.bDelay = typeof data['bDelay'] == 'undefined' ? 3.0 : data['bDelay'];
    this.enemyAlive = false;

    this.currentEnemy;
    this.ticker = this.t;
};

Spawn.prototype.tick = function(deltaTime){
    var enemyToSpawn = null;
    if (!this.enemyAlive && this.ticker >= this.t){
        //attempt to spawn an enemy!
        //get enemy id
        var rand = Math.random()*100;
        var chance = 0;
        for (var i = 0; i < this.chances.length;i++){
            chance += this.chances[i];
            if (rand <= chance){
                if (this.enemies[i] == 'skip'){
                    this.ticker = 0;
                    console.log('skip');
                    return;
                }else{
                    //spawn enemy
                    enemyToSpawn = this.enemies[i];
                    break;
                }
            }
        }
        //no enemy spawned?
        if (!enemyToSpawn){
            enemyToSpawn = this.def;
        }
    }else if (!this.enemyAlive){
        this.ticker += deltaTime;
    }
    if (enemyToSpawn){
        console.log('Tryng to spawn: ' + enemyToSpawn);
        if (typeof this.engine.enemies[enemyToSpawn] == 'undefined'){
            console.log(enemyToSpawn + ' does not exist');
            this.ticker = 0;
            return;
        }
        var newEnemy = new NPC();
        var e = this.engine.enemies[enemyToSpawn];
        newEnemy.setSpawn(this);
        newEnemy.setEngine(this.engine);
        newEnemy.setOwner(null);

        newEnemy.init(e);
        newEnemy.bDelay = this.bDelay;
        this.enemyAlive = true;
        this.zone.addNPC(newEnemy);
        console.log(newEnemy.id);

        this.ticker = 0;
    }

}

exports.Spawn = Spawn;