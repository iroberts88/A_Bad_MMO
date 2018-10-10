
(function(window) {

    var GameMap = function(){
        this.sectors = {};
    };

    GameMap.prototype.init = function(data){
    	for (var s in data.mapData){
    		var sector = this.createSector(s,data.mapData[s]);
    		this.sectors[s] = sector;
    	}
    };

    GameMap.prototype.createSector = function(s,data){
    	var sector = new Sector();
    	sector.init(s,this,data);
    	return sector;
    };
    GameMap.prototype.setVisible = function(sString,visible){
        try{
            this[sString].setVisible(visible)
        }catch(e){
        }
    };
    GameMap.prototype.changeVisibleSectors = function(){
        if (this.sectorData){
            console.log(this.sectorData);
            if (this.sectorData.dir == 'left'){
                this.setVisible((this.sectorData.x-1) + 'x' + this.sectorData.y,true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x+2) + 'x' + this.sectorData.y,false);
                this.setVisible((this.sectorData.x+2) + 'x' + (this.sectorData.y-1),false);
                this.setVisible((this.sectorData.x+2) + 'x' + (this.sectorData.y+1),false);
            }else if (this.sectorData.dir == 'up'){
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y+2),false);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y+2),false);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y+2),false);
            }else if (this.sectorData.dir == 'right'){
                this.setVisible((this.sectorData.x+1) + 'x' + this.sectorData.y,true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x-2) + 'x' + this.sectorData.y,false);
                this.setVisible((this.sectorData.x-2) + 'x' + (this.sectorData.y-1),false);
                this.setVisible((this.sectorData.x-2) + 'x' + (this.sectorData.y+1),false);
            }else if (this.sectorData.dir == 'down'){
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y-2),false);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y-2),false);
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y-2),false);
            }
            this.sectorData = null;
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
    	for (var i = 0; i < data.tiles.length;i++){
            if (typeof map[i+this.pos.x*21] == 'undefined'){
                map[i+this.pos.x*21] = {};
            }
    		for (var j = 0; j < data.tiles[i].length;j++){
 				var newTile = new Tile();
                newTile.init({
                	sectorid: s,
                    x: i,
                    y: j,
                    hd: new SAT.Box(new SAT.Vector(i+this.pos.x*21,j+this.pos.y*21),mainObj.TILE_SIZE,mainObj.TILE_SIZE),
                    resource: data.tiles[i][j][Enums.RESOURCE],
                    open: data.tiles[i][j][Enums.OPEN],
                    triggers: data.tiles[i][j][Enums.TRIGGERS],
                    overlayResource: data.tiles[i][j][Enums.OVERLAYRESOURCE]
                });
                newTile.sprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                newTile.sprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                if (data.tiles[i][j][Enums.RESOURCE] == '1x1'){
                    Graphics.worldContainer2.addChild(newTile.sprite);
                }else{
                    Graphics.worldContainer.addChild(newTile.sprite);
                }
                if (newTile.overlaySprite){
                    newTile.overlaySprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                    newTile.overlaySprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                    if (data.tiles[i][j][Enums.OVERLAYRESOURCE] == '1x1'){
                        Graphics.worldContainer2.addChild(newTile.overlaySprite);
                    }else{
                        Graphics.worldContainer.addChild(newTile.overlaySprite);
                    }
                }
                map[i+this.pos.x*21][j+this.pos.y*21] = newTile;
    		}
    	}
    };
    Sector.prototype.setVisible = function(bool){
        for (var i = 0; i < this.tiles.length;i++){
            for (var j = 0; j < this.tiles[i].length;j++){
                this.tiles[i][j].sprite.visible = bool;
                if (this.tiles[i][j].overlaySprite){
                    this.tiles[i][j].overlaySprite.visible = bool;
                }
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
            this.hd = data.hd;
            this.resource = data.resource; //the graphics resource used
            this.sprite = Graphics.getSprite(data.resource); //tile sprite
            this.sprite.scale.x = mainObj.GAME_SCALE;
            this.sprite.scale.y = mainObj.GAME_SCALE;
            this.open = (typeof data.open == 'undefined')  ? null : data.open;
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

    window.Tile = Tile;
})(window);