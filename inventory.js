// Inventory
var utils = require('./utils.js').Utils,
    Utils = new utils(),
    Attribute = require('./attribute.js').Attribute;

var Inventory = function () {
    
    //a list of items by server id
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
    this.grid0 = new Grid(5,8);
    this.grid1 = null;
    this.grid2 = null;
    this.grid3 = null;
    this.grid4 = null;
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
Inventory.prototype.equipItem = function(index){
   
}
Inventory.prototype.addItemById = function(id){
   //add a single new item by item id
   var item = this.engine.getItem(id);
   if (!item){return;}

   if (this.itemIndex[id]){

   }else{

   }
}
Inventory.prototype.addItem = function(item,amount){
   
}
Inventory.prototype._addItem = function(position){

}
Inventory.prototype.removeItemByIndex = function(itemIndex,amount){

}
Inventory.prototype._removeItem = function(index){

}
Inventory.prototype.contains = function(id){

}
Inventory.prototype.sortByType = function(dir){

}
Inventory.prototype.getClientData = function(){
    var data = {};

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
    this.id = this.owner.engine.getId();
    this.itemid = data.itemid;
    this.item = data.item;

    this.quantity = data.quantity;

    //additionbal info about the item?
    //enchantements... etc?
}
PlayerItem.prototype.getClientData = function(){
    var data = this.item.getClientData();
    var e = this.owner.engine.enums;
    data[e.QUANTITY] = this.quantity;
    data[e.ID] = this.id;
    return data;
}

exports.PlayerItem = PlayerItem;

var Item = function () {}

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

    this.xSize = data['scale']['x'];
    this.ySize = data['scale']['y'];

    //optional values
    this.stack = Utils.udCheck(data['stack'],null,data['stack']);
    this.pierce = Utils.udCheck(data['pierce'],null,data['pierce']);
    this.bludgeon = Utils.udCheck(data['bludgeon'],null,data['bludgeon']);
    this.slash = Utils.udCheck(data['slash'],null,data['slash']);
    this.slots = Utils.udCheck(data['slots'],null,data['slots']);
    this.range = Utils.udCheck(data['range'],null,data['range']);
    this.onEquip = Utils.udCheck(data['onEquip'],null,data['onEquip']);
    this.onEquipText = Utils.udCheck(data['onEquipText'],null,data['onEquipText']);
    this.stats = Utils.udCheck(data['stats'],null,data['stats']);
};
Item.prototype.getClientData = function(){
    var data = {};
    var e = this.owner.engine.enums;

    data[e.NAME] = this.name;
    return data;
}
exports.Item = Item;


var Grid = function (x,y,inventory) {
    this.x = x;
    this.y = y;
    for (var i = 0 ; i < x;i++){
        this[i] = {};
        for (var j = 0; j < y;j++){
            this[i][j] = null;
        }
    }
}

exports.Grid = Grid;