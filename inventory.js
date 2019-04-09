// Inventory
var utils = require('./utils.js').Utils,
    Utils = new utils(),
    Enums = require('./enums.js').Enums,
    Attribute = require('./attribute.js').Attribute,
    Actions = require('./actions.js').Actions;

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
    this.grid0 = new Grid(20,20,this,0);//new Grid(4,8,this,0);
    this.grid1 = null;//new Grid(12,12,this,1);
    this.grid2 = null;//new Grid(12,12,this,2);
    this.grid3 = null;//new Grid(12,12,this,3);
    this.grid4 = null;//new Grid(12,12,this,4);

    this.flip = false;
    this.owner = null;
    this.engine = null;
}
Inventory.prototype.init = function(data){
    this.owner = data.owner;
    this.engine = data.owner.engine;

    this.currentWeight = new Attribute();
    this.currentWeight.init({
        id: Enums.CURRENTWEIGHT,
        owner: this.owner,
        value: 0,
        min: 0,
        max: Infinity,
        formula: function(){
            var cf = 10;
            return Math.round(((this.base*this.pMod)+this.nMod)*cf)/cf;
        },
        next: function(){
            this.owner.speed.set(true);
        }
    });
    this.currentWeight.set();
    this.carryWeight = new Attribute();
    this.carryWeight.init({
        id: Enums.CARRYWEIGHT,
        owner: this.owner,
        value: 0,
        min: 1,
        max: Infinity,
        formula: function(){
            this.base = this.owner.strength.value;
            return Math.round(this.base*this.pMod+this.nMod);
        },
        next: function(){
            this.owner.speed.set(true);
        }
    });
    this.carryWeight.set();
}
Inventory.prototype.changeWeight = function(amt){
    //change the current weight
    var cf = 10;
    this.currentWeight.base += (Math.round(amt*cf) / cf);
    this.currentWeight.set(true);
}
Inventory.prototype.moveItem = function(data){
    //move an item from one slot to another..
    console.log(data);
    var bag = this.getBag(data[Enums.BAG]);
    if (!bag){return;}
    var pos = data[Enums.POSITION];
    if (!Array.isArray(pos)){
        console.log('ERROR - incorrect data pos');
        return;
    }else if(pos.length < 2){
        console.log('ERROR - incorrect data pos2');
        return;
    }
    var flip = data[Enums.FLIPPED];
    if (typeof flip != 'boolean'){
        console.log('ERROR - incorrect data');
        return;
    }
    var id = data[Enums.ID];
    var item = this.getItem(id);
    if (!item){
        console.log('ERROR - no item found');
        return;
    }
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
        if (typeof item.position == 'string'){
            //unequip!
            switch (item.position){
                case Enums.BAG1:
                    if (bag.bag == 1){
                        console.log('bag within bag error!');
                        return false;
                    }
                case Enums.BAG2:
                    if (bag.bag == 2){
                        console.log('bag within bag error!');
                        return false;
                    }
                case Enums.BAG3:
                    if (bag.bag == 3){
                        console.log('bag within bag error!');
                        return false;
                    }
                case Enums.BAG4:
                    if (bag.bag == 4){
                        console.log('bag within bag error!');
                        return false;
                    }
                    break;
            }
             if (!this.unEquipItem(item.position)){
                console.log('Un-equip unsuccessful!');
                return false;
             }
        }else{
            item.clearFromGrid();
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
        //bag.print();//send down client command to successfully equip the item
    }
}

Inventory.prototype.equipItem = function(slot,item){
    //equip an item into an empty slot
    var clientData = {};
    var itemToMove = this.getItem(item);
    if (!itemToMove){
        console.log('ERROR - no item found');
        return;
    }
    //TODO make sure its equipable
    if (!itemToMove.isEquipable(slot)){
        console.log('failed!');
        return;
    }
    if (typeof itemToMove.position == 'string'){
        console.log('ERROR - item is already equipped');
        return false;
    }
    if (this.slots[slot] == null){
        itemToMove.clearFromGrid();
        this.slots[slot] = itemToMove;
        itemToMove.position = slot;
        //alter stats
        for (var i in itemToMove.item.stats){
            var data = {}
            data.stat = this.engine.statEnums[i];
            data.value = itemToMove.item.stats[i];
            data.unit = this.owner;
            Actions.executeAction('alterStat',data);
        }
        if (itemToMove.item.ac){
            var data = {}
            data.stat = this.engine.statEnums['ac'];
            data.value = itemToMove.item.ac;
            data.unit = this.owner;
            Actions.executeAction('alterStat',data);
        }
        if (itemToMove.item.bagSize){
            //equip a new bag!!!!
            switch(parseInt(slot)){
                case Enums.BAG1:
                    console.log('wtf')
                    this.grid1 = new Grid(itemToMove.item.bagSize[0],itemToMove.item.bagSize[1],this,1);
                    clientData[Enums.BAG1] = this.grid1 ? this.grid1.getClientData() : null;
                    console.log(clientData)
                    break;
                case Enums.BAG2:
                    this.grid2 = new Grid(itemToMove.item.bagSize[0],itemToMove.item.bagSize[1],this,2);
                    clientData[Enums.BAG2] = this.grid2 ? this.grid2.getClientData() : null;
                    break;
                case Enums.BAG3:
                    this.grid3 = new Grid(itemToMove.item.bagSize[0],itemToMove.item.bagSize[1],this,3);
                    clientData[Enums.BAG3] = this.grid3 ? this.grid3.getClientData() : null;
                    break;
                case Enums.BAG4:
                    this.grid4 = new Grid(itemToMove.item.bagSize[0],itemToMove.item.bagSize[1],this,4);
                    clientData[Enums.BAG4] = this.grid4 ? this.grid4.getClientData() : null;
                    break;
            }
        }
        //add any on equip properties
        console.log('equipped!!');

        //set weapons
        if (slot == 'main'){
            this.owner.currentMeleeMain = itemToMove.item;
            if (itemToMove.item.twoHanded){
                this.owner.currentMeleeSecond = null;
            }
        }else if (slot == 'secondary'){
            if (itemToMove.item.pierce || itemToMove.item.pierce || itemToMove.item.bludgeon){
                this.owner.currentMeleeSecond = itemToMove.item;
            }else{
                this.owner.currentMeleeSecond = null;
            }
        }else if (slot == 'ranged'){
            this.owner.currentRanged = itemToMove.item;
        }
        //send down client command to successfully equip the item
        clientData[Enums.ITEM] = item;
        clientData[Enums.SLOT] = slot;
        this.engine.queuePlayer(this.owner.owner,Enums.EQUIPITEM,clientData);
    }
}

Inventory.prototype.unEquipItem = function(slot){
    //un-equip an item!!!
    if (this.slots[slot] == null){
        console.log("ERROR - Nothing equipped in " + slot);
        return false;
    }
    var clientData = {};
    var itemToMove = this.slots[slot];
    var bagCheck = true;
    //if replacing a bag, make sure it's empty!
    switch(slot){
        case Enums.BAG1:
            bagCheck = this.grid1.isEmpty();
            break;
        case Enums.BAG2:
            bagCheck = this.grid2.isEmpty();
            break;
        case Enums.BAG3:
            bagCheck = this.grid3.isEmpty();
            break;
        case Enums.BAG4:
            bagCheck = this.grid4.isEmpty();
            break;
    }
    if (!bagCheck){
        console.log("ERROR - Bag not empty!");
        return false;
    }
    //alter stats
    for (var i in itemToMove.item.stats){
        var data = {}
        data.stat = this.engine.statEnums[i];
        data.value = itemToMove.item.stats[i];
        data.unit = this.owner;
        data.reverse = true;
        Actions.executeAction('alterStat',data);
    }
    if (itemToMove.item.ac){
        var data = {}
        data.stat = this.engine.statEnums['ac'];
        data.value = itemToMove.item.ac;
        data.unit = this.owner;
        data.reverse = true;
        Actions.executeAction('alterStat',data);
    }
    if (itemToMove.item.bagSize){
        //equip a new bag!!!!
        switch(slot){
            case Enums.BAG1:
                this.grid1 = null;
                clientData[Enums.BAG1] = this.grid1 ? this.grid1.getClientData() : null;
                break;
            case Enums.BAG2:
                this.grid2 = null;
                clientData[Enums.BAG2] = this.grid2 ? this.grid2.getClientData() : null;
                break;
            case Enums.BAG3:
                this.grid3 = null;
                clientData[Enums.BAG3] = this.grid3 ? this.grid3.getClientData() : null;
                break;
            case Enums.BAG4:
                this.grid4 = null;
                clientData[Enums.BAG4] = this.grid4 ? this.grid4.getClientData() : null;
                break;
        }
    }
    //add any on equip properties
    console.log('un equipped!!');
    //set weapons
    if (slot == 'main'){
        this.owner.currentMeleeMain = this.owner.defaultWeapon;
    }else if (slot == 'secondary'){
        this.owner.currentMeleeSecond = this.owner.defaultWeapon;
    }else if (slot == 'ranged'){
        this.owner.currentRanged = null;
    }
    //send down client command to successfully unequip the item
    clientData[Enums.ITEM] = itemToMove.id;
    clientData[Enums.SLOT] = slot;
    this.engine.queuePlayer(this.owner.owner,Enums.UNEQUIPITEM,clientData);
    this.slots[slot] = null;
    return true;
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
    if (item.lore &&  this.itemIndex[id]){
        //you already have this lore item!
        return 0;
    }
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
    this.changeWeight(this.items[itemid].item.weight);
    //data.grid.print();
    var d = {};
    d[Enums.ITEM] = data.pitem.getClientData();
    d[Enums.FLIPPED] = this.flip;
    d[Enums.POSITION] = [data.x,data.y];
    d[Enums.BAG] = data.grid.bag;
    this.engine.queuePlayer(this.owner.owner,Enums.ADDITEM,d);
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
Inventory.prototype.getItem = function(id){
    if (typeof this.items[id] == 'undefined'){
        return null;
    }else{
        return this.items[id];
    }
}
Inventory.prototype.getClientData = function(){
    var data = {};
    data[Enums.ITEMS] = {};
    for (var i in this.items){
        data[Enums.ITEMS][i] = this.items.getClientData();
    }
    data[Enums.BAG] = this.grid0.getClientData();
    data[Enums.BAG1] = this.grid1 ? this.grid1.getClientData() : null;
    data[Enums.BAG2] = this.grid2 ? this.grid2.getClientData() : null;
    data[Enums.BAG3] = this.grid3 ? this.grid3.getClientData() : null;
    data[Enums.BAG4] = this.grid4 ? this.grid4.getClientData() : null;

    data[Enums.COPPER] = this.owner.copper;
    data[Enums.SILVER] = this.owner.silver;
    data[Enums.GOLD] = this.owner.gold;
    data[Enums.PLATINUM] = this.owner.platinum;
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
    var e = Enums;
    data[Enums.QUANTITY] = this.quantity;
    data[Enums.ID] = this.id;
    return data;
}
PlayerItem.prototype.setQuantity = function(amt){
    this.quantity = amt;
    this.clientData[Enums.QUANTITY] = this.quantity;
    this.engine.queuePlayer(this.owner.owner,Enums.SETITEMQUANTITY,data);
}
PlayerItem.prototype.addQuantity = function(amt){
    this.quantity += amt;
    this.clientData[Enums.QUANTITY] = this.quantity;
    var data = {};
    data[Enums.QUANTITY] = this.quantity;
    data[Enums.ID] = this.id;
    this.engine.queuePlayer(this.owner.owner,Enums.SETITEMQUANTITY,data);
}
PlayerItem.prototype.checkSlot = function(itemSlot,slot){
    if (this.engine.slotEnums2[itemSlot] == slot){
        return true;
    }
    return false;
}
PlayerItem.prototype.clearFromGrid= function(){
    //remove from old position
    var oldX = this.flipped ? this.item.ySize : this.item.xSize;
    var oldY = this.flipped ? this.item.xSize : this.item.ySize;
    for (var i = 0; i < oldX;i++){
        for (var j = 0; j < oldY;j++){
            this.grid.arr[this.position[0]+i][this.position[1]+j] = null;
        }
    }
}
PlayerItem.prototype.isEquipable = function(s){
    if (!this.item.slots){
        console.log('not equippable...')
        return false;
    }
    var slotBool = false;
    for (var i = 0; i < this.item.slots.length;i++){
        if (this.checkSlot(s,this.item.slots[i])){
            slotBool = true;
            break;
        }
    }
    if (!slotBool){
        console.log('incorrect slot......')
        return false;
    }
    var cBool = false;
    var rBool = false;
    var char = this.owner;
    for (var i in this.item.classes){
        var c = i.toLowerCase();
        if (c == 'all' || c == char.class){
            cBool = true;
        }
    }
    for (var i in this.item.races){
        var c = i.toLowerCase();
        if (c == 'all' || c == char.race){
            rBool = true;
        }
    }
    if (!cBool || !rBool){
        console.log('incorrect race/class....')
        return false;
    }
    //test 2handed
    if (s == Enums.SECONDARY){
        if (this.owner.inventory.slots['main']){
            if (this.owner.inventory.slots['main'].item.twoHanded){
                console.log('usingbothhands....')
                return false;
            }
        }
    }
    if (s == Enums.MAIN && this.owner.inventory.slots['secondary']){
        if (this.item.twoHanded){
            console.log('iteminsecondary....')
            return false;
        }
    }
    return true;
};
exports.PlayerItem = PlayerItem;

var Item = function (engine) {
    this.engine = engine;
}

Item.prototype.init = function(data){
    this.itemid = data['itemid'];
    this.name = data['name'];
    this.info = data['info'];
    this.resource = data['resource'];
    this.onUse = data['onUse'];
    this.value = data['value'];
    this.flavorText = data['flavorText'];
    this.weight = data['weight'];

    this.xSize = typeof data['scale'] == 'undefined' ? 1 : parseInt(data['scale']['x']);
    this.ySize = typeof data['scale'] == 'undefined' ? 1 : parseInt(data['scale']['y']);

    //optional / equipment values
    this.classes = {};
    this.races = {};
    if (!Utils._udCheck(data['classes'])){
        for (var i in data['classes']){
            if (!data['classes'][i]){continue;}
            switch (i){
                case 'fighter':
                    this.classes['Fighter'] = true;
                    break;
                case 'all':
                    this.classes['All'] = true;
                    break;
                case 'thief':
                    this.classes['Thief'] = true;
                    break;
                case 'mage':
                    this.classes['Mage'] = true;
                    break;
            }
        }
    }
    if (!Utils._udCheck(data['races'])){
        for (var i in data['races']){
            if (!data['races'][i]){continue;}
            switch (i){
                case 'human':
                    this.races['Human'] = true;
                    break;
                case 'all':
                    this.races['All'] = true;
                    break;
                case 'elf':
                    this.races['Elf'] = true;
                    break;
                case 'dwarf':
                    this.races['Dwarf'] = true;
                    break;
                case 'gnome':
                    this.races['Gnome'] = true;
                    break;
            }
        }
    }
    this.stack = Utils.udCheck(data['stack'],null,data['stack']);
    this.pierce = Utils.udCheck(data['pierce'],null,data['pierce']);
    this.bludgeon = Utils.udCheck(data['bludgeon'],null,data['bludgeon']);
    this.slash = Utils.udCheck(data['slash'],null,data['slash']);
    this.slots = Utils.udCheck(data['slots'],null,data['slots']);
    this.twoHanded = Utils.udCheck(data['twoHanded'],null,data['twoHanded']);
    this.lore = Utils.udCheck(data['lore'],null,data['lore']);
    this.magic = Utils.udCheck(data['magic'],null,data['magic']);
    this.range = Utils.udCheck(data['range'],null,data['range']);
    this.onEquip = Utils.udCheck(data['onEquip'],null,data['onEquip']);
    this.onEquipText = Utils.udCheck(data['onEquipText'],null,data['onEquipText']);
    this.stats = Utils.udCheck(data['stats'],{},data['stats']);
    this.ac = Utils.udCheck(data['ac'],null,data['ac']);
    this.bagSize = Utils.udCheck(data['bagSize'],null,data['bagSize']);

    this.clientData = this._getClientData();
};

Item.prototype.getClientData = function(){
    //add additional info that may differ per item??
    return this.clientData;
}

Item.prototype._getClientData = function(){
    var data = {};
    var e = Enums;

    data[Enums.ITEMID] = this.itemid;
    data[Enums.NAME] = this.name;
    data[Enums.LORE] = this.lore;
    data[Enums.MAGIC] = this.magic;
    data[Enums.TWOHANDED] = this.twoHanded;
    data[Enums.RESOURCE] = this.resource;
    data[Enums.VALUE] = this.value;
    data[Enums.STACK] = this.stack;
    data[Enums.SIZE] = [this.xSize,this.ySize];
    data[Enums.WEIGHT] = this.weight;
    data[Enums.FLAVORTEXT] = this.flavorText;
    if (this.slots){
        //this is an equippable item...
        data[Enums.CLASSES] = [];
        data[Enums.RACES] = [];
        for (var i in this.classes){
            if (!this.classes[i]){continue;}
            data[Enums.CLASSES].push(i);
        }

        for (var i in this.races){
            if (!this.races[i]){continue;}
            data[Enums.RACES].push(i);
        }

        data[Enums.SLOTS] = [];
        for (var i = 0; i < this.slots.length;i++){
            data[Enums.SLOTS].push(this.slots[i]);
        }
        data[Enums.PIERCE] = this.pierce;
        data[Enums.SLASH] = this.slash;
        data[Enums.BLUDGEON] = this.bludgeon;
        data[Enums.RANGE] = this.range;
        data[Enums.ONEQUIPTEXT] = this.onEquipText;
        data[Enums.AC] = this.ac;
        data[Enums.BAGSIZE] = this.bagSize;
        if (this.stats){
            data[Enums.STATS] = {};
            for (var i in this.stats){
                data[Enums.STATS][i] = this.stats[i];
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
    data[Enums.X] = this.x;
    data[Enums.Y] = this.y;
    data[Enums.GRID] = {};
    data[Enums.BAG] = this.bag;
    for (var i in this.arr){
        data[Enums.GRID][i] = {};
        for (var j in this.arr[i]){
            data[Enums.GRID][i][j] = this.arr[i][j];
        }
    }
    return data;
}
Grid.prototype.isEmpty = function(){
    for (var i = 0 ; i < this.x;i++){
        for (var j = 0; j < this.y;j++){
            if (this.arr[i][j]){
                return false;
            }
        }
    }
    return true;
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