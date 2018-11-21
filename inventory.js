// Inventory
var utils = require('./utils.js').Utils,
    Utils = new utils(),
    Attribute = require('./attribute.js').Attribute;

var Inventory = function () {
    
    //actual player item container
    this.items = {};
    //list of item references by DB id
    this.itemIndex = {};

    this.currentWeight = 0;
    this.carryWeight = 0;
    this.cursorItem = null;
    this.slots = {
        'ear': null,
        'ear2': null,
        'head': null,
        'face': null,
        'neck': null,
        'arms': null,
        'back': null,
        'shoulders': null,
        'chest': null,
        'wrist': null,
        'wrist2': null,
        'hands': null,
        'finger': null,
        'finger2': null,
        'waist': null,
        'legs': null,
        'feet': null,
        'trinket': null,
        'trinket2': null,
        'main': null,
        'secondary': null,
        'ranged': null,
        'ammo': null,
        'bag1': null,
        'bag2': null,
        'bag3': null,
        'bag4': null
    };
    this.grid0 = new Grid(12,12,this,0);
    this.grid1 = new Grid(12,12,this,1);
    this.grid2 = new Grid(12,12,this,2);
    this.grid3 = new Grid(12,12,this,3);
    this.grid4 = new Grid(12,12,this,4);

    this.flip = false;
    this.owner = null;
    this.engine = null;
}
Inventory.prototype.init = function(data){
    this.owner = data.owner;
    this.engine = data.owner.engine;

    this.currentWeight = new Attribute();
    this.currentWeight.init({
        id: this.engine.enums.CURRENTWEIGHT,
        owner: this.owner,
        value: 0,
        min: 0,
        max: Infinity,
        next: function(){
            this.owner.speed.set(true);
        }
    });

    this.carryWeight = new Attribute();
    this.carryWeight.init({
        id: this.engine.enums.CARRYWEIGHT,
        owner: this.owner,
        value: 0,
        min: 1,
        max: Infinity,
        formula: function(){
            this.base = this.owner.strength.value;
            return Math.round((this.base+this.nMod)*this.pMod);
        },
        next: function(){
            this.owner.speed.set(true);
        }
    });
}
Inventory.prototype.changeWeight = function(){
    //change the current weight
    var cf = 10;
    this.currentWeight = ((this.currentWeight*cf + (amt*cf)*mult) / cf);
}
Inventory.prototype.moveItem = function(data){
    //move an item from one slot to another..
    console.log(data);
    var bag = this.getBag(data[this.engine.enums.BAG]);
    if (!bag){return;}
    var pos = data[this.engine.enums.POSITION];
    var flip = data[this.engine.enums.FLIPPED];
    var id = data[this.engine.enums.ID];
    var item = this.items[id];
    var x = flip ? item.item.ySize : item.item.xSize;
    var y = flip ? item.item.xSize : item.item.ySize;
    //check that position is available
    var open = true;
    for (var i = 0; i < x;i++){
        if (pos[0]+i >= bag.x){
            open = false;
            continue;
        }
        for (var j = 0; j < y;j++){
            if (pos[1]+j >= bag.y){
                open = false;
                continue;
            }
            if (bag.arr[pos[0]+i][pos[1]+j] != null){
                if (bag.arr[pos[0]+i][pos[1]+j] != id){
                    open = false;
                }
            }
        }
    }
    if (open){
        console.log("It fits!");
        //remove from old position
        var oldX = item.flipped ? item.item.ySize : item.item.xSize;
        var oldY = item.flipped ? item.item.xSize : item.item.ySize;
        for (var i = 0; i < oldX;i++){
            for (var j = 0; j < oldY;j++){
                item.grid.arr[item.position[0]+i][item.position[1]+j] = null;
            }
        }
        //add to new position
        for (var i = 0; i < x;i++){
            for (var j = 0; j < y;j++){
                bag.arr[pos[0]+i][pos[1]+j] = id;
            }
        }
        item.position = pos;
        item.flipped = flip;
        item.grid = bag;
        bag.itemLocIndex[id] = {
            x: pos[0],
            y: pos[1]
        }
        bag.print();
    }
}
Inventory.prototype.equipItem = function(index){
   
}
Inventory.prototype.addItemById = function(id,amt){
    //add a single new item by item id
    var amtAdded = this._addItemById(id,amt)
    console.log('added ' + amtAdded + ' item(s)');
}
Inventory.prototype._addItemById = function(id,amt){
    var item = this.engine.getItem(id);
    var startAmt = amt;
    if (!item || amt == NaN){return 0;}
    if (this.itemIndex[id] && item.stack){
        //item is stackable and in inventory.
        for (var i = 0; i < this.itemIndex[id].length;i++){
            var nextItem = this.items[this.itemIndex[id][i]];
            if (nextItem.quantity + amt <= item.stack){
                console.log("adding " + amt + '!!!')
                nextItem.addQuantity(amt);
                amt = 0;
                return startAmt;
            }else if (item.stack - nextItem.quantity > 0){
                console.log("adding " + (item.stack - nextItem.quantity) + ' items');
                amt -= (item.stack - nextItem.quantity);
                nextItem.addQuantity(item.stack - nextItem.quantity);
            }
        }
        while (amt > 0){
            //still left over items.
            //add a new player item
            if (amt >= item.stack){

                if (this.addItem(item,item.stack)){
                    amt -= item.stack
                }else{
                    return startAmt - amt;
                }
            }else{
                if (this.addItem(item,amt)){
                    return startAmt;
                }else{
                    return startAmt - amt;
                }
            }
        }
        return startAmt;
    }else{
        if (item.stack){
            while (amt > 0){
                var nextAmt = Math.min(amt,item.stack);
                if (this.addItem(item,nextAmt)){
                    amt -= nextAmt;
                }else{
                    return startAmt - amt;
                }
            }
            return startAmt;
        }else{
            while(amt){
                if (this.addItem(item,1)){
                    amt -= 1;
                }else{
                    return startAmt - amt;
                }
            }
            return startAmt;
        }
    }
}
Inventory.prototype.willFit = function(x,y){
    //find an open spot for an item of the given dimensions
    var grids = [this.grid0,this.grid1,this.grid2,this.grid3,this.grid4];
    this.flip = false;
    for (var i = 0; i <grids.length;i++){
        if (grids[i]){
            var f = grids[i].willFit(x,y);
            if (f){
                return f;
            }
        }
    }
    return false;
}
Inventory.prototype.addItem = function(item,amt){
    //otherwise, add a new item
    console.log("Adding " + amt + ' ' + item.name + '(s)');
    var newItem = new PlayerItem();
    newItem.init({
        owner: this.owner,
        item: item,
        quantity: amt
    });
    var fit = this.willFit(item.xSize,item.ySize);
    fit.pitem = newItem;
    fit.item = item;
    if (fit){
        //additem?
        this._addItem(fit);
        return true;
    }else{
        return false;
    }
}
Inventory.prototype._addItem = function(data){
    var itemid = data.pitem.id;
    var xSize = this.flip ? data.item.ySize : data.item.xSize;
    var ySize = this.flip ? data.item.xSize : data.item.ySize;

    for (var i = 0; i < xSize;i++){
        for (var j = 0; j < ySize;j++){
            data.grid.arr[data.x+i][data.y+j] = itemid;
        }
    }
    this.items[itemid] = data.pitem;
    data.grid.itemLocIndex[itemid] = {
        x: data.x,
        y: data.y
    }
    if (typeof this.itemIndex[data.item.itemid] != 'undefined'){
        this.itemIndex[data.item.itemid].push(itemid);
    }else{
        this.itemIndex[data.item.itemid] = [itemid];
    }
    this.items[itemid].flipped = this.flip;
    this.items[itemid].position = [data.x,data.y];
    this.items[itemid].grid = this.getBag(data.grid.bag);
    data.grid.print();
    var d = {};
    d[this.engine.enums.ITEM] = data.pitem.getClientData();
    d[this.engine.enums.FLIPPED] = this.flip;
    d[this.engine.enums.POSITION] = [data.x,data.y];
    d[this.engine.enums.BAG] = data.grid.bag;
    this.engine.queuePlayer(this.owner.owner,this.engine.enums.ADDITEM,d);
}
Inventory.prototype.removeItemByIndex = function(itemIndex,amount){

}
Inventory.prototype._removeItem = function(index){

}
Inventory.prototype.contains = function(id){

}
Inventory.prototype.sortByType = function(dir){

}
Inventory.prototype.getBag = function(num){
    switch(num){
        case 0:
            return this.grid0;
            break;
        case 1:
            return this.grid1;
            break;
        case 2:
            return this.grid2;
            break;
        case 3:
            return this.grid3;
            break;
        case 4:
            return this.grid4;
            break;
    }
    return null;
}
Inventory.prototype.getClientData = function(){
    var data = {};
    data[this.engine.enums.ITEMS] = {};
    for (var i in this.items){
        data[this.engine.enums.ITEMS][i] = this.items.getClientData();
    }
    data[this.engine.enums.BAG] = this.grid0.getClientData();
    data[this.engine.enums.BAG1] = this.grid1 ? this.grid1.getClientData() : null;
    data[this.engine.enums.BAG2] = this.grid2 ? this.grid2.getClientData() : null;
    data[this.engine.enums.BAG3] = this.grid3 ? this.grid3.getClientData() : null;
    data[this.engine.enums.BAG4] = this.grid4 ? this.grid4.getClientData() : null;

    data[this.engine.enums.COPPER] = this.owner.copper;
    data[this.engine.enums.SILVER] = this.owner.silver;
    data[this.engine.enums.GOLD] = this.owner.gold;
    data[this.engine.enums.PLATINUM] = this.owner.platinum;
    return data;
}
Inventory.prototype.getDBObj = function(){
    var data = {};
    //the inventory object contains
    return data;
}
exports.Inventory = Inventory;

//the player item added to the inventory
//only containes a referance to the engine item
var PlayerItem = function () {}

PlayerItem.prototype.init = function(data){
    this.owner = data.owner;
    this.engine = data.owner.engine;
    this.id = this.owner.engine.getId();
    this.itemid = data.itemid;
    this.item = data.item;
    this.flipped = data.flipped;
    this.position = data.position;
    this.quantity = data.quantity;
    this.grid = data.grid;

    //additional info about the item?
    //enchantements... etc?
    this.clientData = this.getClientData();
    console.log("new player item created");
}
PlayerItem.prototype.getClientData = function(){
    var data = this.item.getClientData();
    var e = this.owner.engine.enums;
    data[e.QUANTITY] = this.quantity;
    data[e.ID] = this.id;
    return data;
}
PlayerItem.prototype.setQuantity = function(amt){
    this.quantity = amt;
    this.clientData[this.owner.engine.enums.QUANTITY] = this.quantity;
    this.engine.queuePlayer(this.owner.owner,this.engine.enums.SETITEMQUANTITY,data);
}
PlayerItem.prototype.addQuantity = function(amt){
    this.quantity += amt;
    this.clientData[this.owner.engine.enums.QUANTITY] = this.quantity;
    var data = {};
    data[this.engine.enums.QUANTITY] = this.quantity;
    data[this.engine.enums.ID] = this.id;
    this.engine.queuePlayer(this.owner.owner,this.engine.enums.SETITEMQUANTITY,data);
}

exports.PlayerItem = PlayerItem;

var Item = function (engine) {
    this.engine = engine;
}

Item.prototype.init = function(data){
    this.itemid = data['itemid'];
    this.name = data['name'];
    this.info = data['info'];
    this.lore = data['lore'];
    this.resource = data['resource'];
    this.onUse = data['onUse'];
    this.value = data['value'];
    this.flavorText = data['flavorText'];
    this.weight = data['weight'];

    this.xSize = parseInt(data['scale']['x']);
    this.ySize = parseInt(data['scale']['y']);

    //optional / equipment values
    this.stack = Utils.udCheck(data['stack'],null,data['stack']);
    this.pierce = Utils.udCheck(data['pierce'],null,data['pierce']);
    this.bludgeon = Utils.udCheck(data['bludgeon'],null,data['bludgeon']);
    this.slash = Utils.udCheck(data['slash'],null,data['slash']);
    this.slots = Utils.udCheck(data['slots'],null,data['slots']);
    this.twoHanded = Utils.udCheck(data['twoHanded'],null,data['twoHanded']);
    this.range = Utils.udCheck(data['range'],null,data['range']);
    this.onEquip = Utils.udCheck(data['onEquip'],null,data['onEquip']);
    this.onEquipText = Utils.udCheck(data['onEquipText'],null,data['onEquipText']);
    this.stats = Utils.udCheck(data['stats'],null,data['stats']);


};
Item.prototype.getClientData = function(){
    var data = {};
    var e = this.engine.enums;

    data[e.ITEMID] = this.itemid;
    data[e.NAME] = this.name;
    data[e.LORE] = this.lore;
    data[e.RESOURCE] = this.resource;
    data[e.VALUE] = this.value;
    data[e.STACK] = this.stack;
    data[e.SIZE] = [this.xSize,this.ySize];
    data[e.WEIGHT] = this.weight;
    data[e.FLAVORTEXT] = this.flavorText;
    if (this.slots){
        //this is an equippable item...
        data[e.SLOTS] = [];
        for (var i = 0; i < this.slots.length;i++){
            data[e.SLOTS].push(this.engine.getSlot(this.slots[i]));
        }
        data[e.PIERCE] = this.pierce;
        data[e.SLASH] = this.slash;
        data[e.BLUDGEON] = this.bludgeon;
        data[e.RANGE] = this.range;
        data[e.ONEQUIPTEXT] = this.onEquipText;
        if (this.stats){
            data[e.STATS] = {};
            for (var i = 0; i < this.stats.length;i++){
                data[e.STATS][this.engine.getStat(i)] = this.stats[i];
            }
        }
    }
    return data;
}
exports.Item = Item;


var Grid = function (x,y,inventory,bag) {
    //item location reference;
    this.itemLocIndex = {};
    this.i = inventory;
    this.bag = bag;
    this.x = x;
    this.y = y;
    this.arr = {};
    for (var i = 0 ; i < x;i++){
        this.arr[i] = {};
        for (var j = 0; j < y;j++){
            this.arr[i][j] = null;
        }
    }
}
Grid.prototype.getClientData = function(){
    var data = {}
    data[this.i.engine.enums.X] = this.x;
    data[this.i.engine.enums.Y] = this.y;
    data[this.i.engine.enums.GRID] = {};
    data[this.i.engine.enums.BAG] = this.bag;
    for (var i in this.arr){
        data[this.i.engine.enums.GRID][i] = {};
        for (var j in this.arr[i]){
            data[this.i.engine.enums.GRID][i][j] = this.arr[i][j];
        }
    }
    return data;
}
Grid.prototype.print = function(){
    for (var i = 0; i < this.y;i++){
        var str = '';
        for (var j = 0; j < this.x;j++){
            if (this.arr[j][i]){
                str +=this.i.items[this.arr[j][i]].item.name.charAt(0);
            }else{
                str += '-'
            }
        }
        console.log(str);
    }
}

Grid.prototype.willFit = function(x,y){
    for (var i = 0; i < this.y;i++){
        for (var j = 0; j < this.x;j++){
            if (this.arr[j][i] == null){
                var willFit = this.willFitInNode(parseInt(j),parseInt(i),x,y);
                if (willFit){
                    return {
                        grid: this,
                        x: parseInt(j),
                        y: parseInt(i)
                    }
                }
            }
        }
    }
    return false;
}

Grid.prototype.willFitInNode = function(sX,sY,x,y){
    var open1 = true;
    var open2 = true;
    for (var i = 0; i < x;i++){
        if (sX+i >= this.x){
            open1 = false;
            continue;
        }
        for (var j = 0; j < y;j++){
            if (sY+j >= this.y){
                open1 = false;
                continue;
            }
            if (this.arr[sX+i][sY+j] != null){
                open1 = false;
            }
        }
    }
    if (open1){
        return true;
    }
    for (var i = 0; i < y;i++){
        if (sX+i >= this.x){
            open2 = false;
            continue;
        }
        for (var j = 0; j < x;j++){
            if (sY+j >= this.y){
                open2 = false;
                continue;
            }
            if (this.arr[sX+i][sY+j] != null){
                open2 = false;
            }
        }
    }

    if (open2){
        this.i.flip = true;
        return true;
    }else{
        return false;
    }
}

exports.Grid = Grid;