
var P = SAT.Polygon,
    C = SAT.Circle,
    V = SAT.Vector;

(function(window) {

    var GameMap = function(){
        this.sectors = {};
        this.currentVisibleSectors = []; //TODO actually change visible sectors
    };

    GameMap.prototype.init = function(data){
    	for (var s in data[Enums.MAPDATA]){
    		var sector = this.createSector(s,data[Enums.MAPDATA][s]);
    		this.sectors[s] = sector;
    	}
        var cs = this.getSector(Player.currentCharacter.hb.pos.x,Player.currentCharacter.hb.pos.y);
        for (var i = -1;i < 2;i++){
            for (var j = -1;j < 2; j++){
                var sec = this._getSector(cs.pos.x+i,cs.pos.y+j);
                if (sec){
                    sec.setVisible(true);
                }
            }
        }
    };

    GameMap.prototype.createSector = function(s,data){
        var sector = new Sector();
        sector.init(s,this,data);
        return sector;
    };

    GameMap.prototype.getSector = function(x,y){
        if (typeof this.sectors[Math.floor(x/mainObj.SECTOR_SIZE)+'x'+Math.floor(y/mainObj.SECTOR_SIZE)] != 'undefined'){
            return this.sectors[Math.floor(x/mainObj.SECTOR_SIZE)+'x'+Math.floor(y/mainObj.SECTOR_SIZE)];
        }else{
            return null;
        }
    };
    GameMap.prototype._getSector = function(x,y){
        if (typeof this.sectors[x+'x'+y] != 'undefined'){
            return this.sectors[x+'x'+y];
        }else{
            return null;
        }
    };
    GameMap.prototype.setVisible = function(sString,visible){
        try{
            this.sectors[sString].setVisible(visible)
        }catch(e){
            console.log(sString);
        }
    };
    GameMap.prototype.updateVisibleSectors = function(c,n){
        var x = n.pos.x-c.pos.x;
        var y = n.pos.y-c.pos.y;
        console.log(x);
        console.log(y);
        if (x == -1){
            this.setVisible((n.pos.x-1) + 'x' + n.pos.y,true);
            this.setVisible((n.pos.x-1) + 'x' + (n.pos.y-1),true);
            this.setVisible((n.pos.x-1) + 'x' + (n.pos.y+1),true);
            this.setVisible((n.pos.x+2) + 'x' + n.pos.y,false);
            this.setVisible((n.pos.x+2) + 'x' + (n.pos.y-1),false);
            this.setVisible((n.pos.x+2) + 'x' + (n.pos.y+1),false);
            if (y == -1){
                this.setVisible((n.pos.x+2) + 'x' + (n.pos.y+2),false);
            }
            if (y == 1){
                this.setVisible((n.pos.x+2) + 'x' + (n.pos.y-2),false);
            }
        }else if (x == 1){
            this.setVisible((n.pos.x+1) + 'x' + n.pos.y,true);
            this.setVisible((n.pos.x+1) + 'x' + (n.pos.y-1),true);
            this.setVisible((n.pos.x+1) + 'x' + (n.pos.y+1),true);
            this.setVisible((n.pos.x-2) + 'x' + n.pos.y,false);
            this.setVisible((n.pos.x-2) + 'x' + (n.pos.y-1),false);
            this.setVisible((n.pos.x-2) + 'x' + (n.pos.y+1),false);
            if (y == -1){
                this.setVisible((n.pos.x-2) + 'x' + (n.pos.y+2),false);
            }
            if (y == 1){
                this.setVisible((n.pos.x-2) + 'x' + (n.pos.y-2),false);
            }
        }
        if (y == -1){
            this.setVisible(n.pos.x + 'x' + (n.pos.y-1),true);
            this.setVisible((n.pos.x-1) + 'x' + (n.pos.y-1),true);
            this.setVisible((n.pos.x+1) + 'x' + (n.pos.y-1),true);
            this.setVisible(n.pos.x + 'x' + (n.pos.y+2),false);
            this.setVisible((n.pos.x+1) + 'x' + (n.pos.y+2),false);
            this.setVisible((n.pos.x-1) + 'x' + (n.pos.y+2),false);
        }else if (y == 1){
            this.setVisible(n.pos.x + 'x' + (n.pos.y+1),true);
            this.setVisible((n.pos.x-1) + 'x' + (n.pos.y+1),true);
            this.setVisible((n.pos.x+1) + 'x' + (n.pos.y+1),true);
            this.setVisible((n.pos.x+1) + 'x' + (n.pos.y-2),false);
            this.setVisible((n.pos.x-1) + 'x' + (n.pos.y-2),false);
            this.setVisible(n.pos.x + 'x' + (n.pos.y-2),false);
        }
    };
    GameMap.prototype.collideUnit = function(unit,dt){
        var xDist = unit.moveVector.x*unit.speed*dt;
        var yDist = unit.moveVector.y*unit.speed*dt;
        var hyp = Math.sqrt((xDist*xDist) + (yDist*yDist));
        for (var i = 0; i <= hyp;i++){
            unit.hb.pos.x += xDist/hyp;
            var tile = Game.map[Math.floor((unit.hb.pos.x+unit.cRadius*unit.moveVector.x)/mainObj.TILE_SIZE)][Math.floor((unit.hb.pos.y+unit.cRadius*unit.moveVector.y)/mainObj.TILE_SIZE)];
            if (!tile.open){
                unit.hb.pos.x -= xDist/hyp;
            }
            unit.hb.pos.y += yDist/hyp;
            var tile = Game.map[Math.floor((unit.hb.pos.x+unit.cRadius*unit.moveVector.x)/mainObj.TILE_SIZE)][Math.floor((unit.hb.pos.y+unit.cRadius*unit.moveVector.y)/mainObj.TILE_SIZE)];
        }
    };
    window.GameMap = GameMap;
})(window);

var getSectorXY = function(string){
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

(function(window) {

    var Sector = function(){
    	this.pos = null;
    	this.map = null;
    	this.TILE_SIZE = mainObj.TILE_SIZE;
    	this.fullSectorSize = mainObj.TILE_SIZE*21;
    };

    Sector.prototype.init = function(s,map,data){
    	this.pos = getSectorXY(s);
    	this.map = map;
    	for (var i = 0; i < data[Enums.TILES].length;i++){
            if (typeof map[i+this.pos.x*21] == 'undefined'){
                map[i+this.pos.x*21] = {};
            }
    		for (var j = 0; j < data[Enums.TILES][i].length;j++){
 				var newTile = new Tile();
                var r = data[Enums.TILES][i][j][Enums.RESOURCE];
                var or = data[Enums.TILES][i][j][Enums.OVERLAYRESOURCE];
                newTile.init({
                	sectorid: s,
                    x: i,
                    y: j,
                    resource: data[Enums.TILES][i][j][Enums.RESOURCE],
                    open: data[Enums.TILES][i][j][Enums.OPEN],
                    triggers: data[Enums.TILES][i][j][Enums.TRIGGERS],
                    overlayResource: data[Enums.TILES][i][j][Enums.OVERLAYRESOURCE]
                });
                newTile.sprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                newTile.sprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                if (r == 'deep_water' || r.charAt(r.length-1) == 'e'){
                    Graphics.worldContainer2.addChild(newTile.sprite);
                }else{
                    Graphics.worldContainer.addChild(newTile.sprite);
                }
                if (newTile.overlaySprite){
                    newTile.overlaySprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                    newTile.overlaySprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                    if (r == 'deep_water' || or.charAt(or.length-1) == 'e'){
                        Graphics.worldContainer2.addChild(newTile.overlaySprite);
                    }else{
                        Graphics.worldContainer.addChild(newTile.overlaySprite);
                    }
                }
                map[i+this.pos.x*21][j+this.pos.y*21] = newTile;
                newTile.setVisible(false);
    		}
    	}
    };
    Sector.prototype.setVisible = function(bool){
        for (var i = this.pos.x*21; i < this.pos.x*21 +21;i++){
            for (var j = this.pos.y*21; j < this.pos.y*21 +21;j++){
                this.map[i][j].setVisible(bool);
            }
        }
    };

    window.Sector = Sector;
})(window);

(function(window) {

    var Tile = function(){};

    Tile.prototype.init = function(data){ 
    	try{
    		this.sectorid = data.sectorid;
            this.x = data.x;
            this.y = data.y;
            this.hb = data.hb;
            this.resource = data.resource; //the graphics resource used
            this.sprite = Graphics.getSprite(data.resource); //tile sprite
            this.sprite.scale.x = mainObj.GAME_SCALE;
            this.sprite.scale.y = mainObj.GAME_SCALE;
            this.open = (typeof data.open == 'undefined')  ? false : data.open;
            this.overlayResource = (typeof data.overlayResource == 'undefined')  ? null : data.overlayResource;
            this.overlaySprite = null; //2nd layer sprite
            if (this.overlayResource){
                this.overlaySprite = Graphics.getSprite(data.overlayResource); //tile sprite
                this.overlaySprite.scale.x = mainObj.GAME_SCALE;
                this.overlaySprite.scale.y = mainObj.GAME_SCALE;
                this.overlaySprite.visible = true;
            }
            this.triggers = (typeof data.triggers == 'undefined')  ? [] : data.triggers;
            this.sprite.visible = true;
        }catch(e){
            console.log("failed to init Tile");
            console.log(e);
        }
    };

    Tile.prototype.setVisible = function(bool){
        this.sprite.visible = bool;
        if (this.overlaySprite){
            this.overlaySprite.visible = bool;
        }
    };

    window.Tile = Tile;
})(window);