
var slotEnums = {};
slotEnums[Enums.HEAD] = 'head';

slotEnums[Enums.EAR1] = 'ear';
slotEnums[Enums.EAR2] = 'ear';
slotEnums[Enums.HEAD] = 'head';
slotEnums[Enums.FACE] = 'face';
slotEnums[Enums.NECK] = 'neck';
slotEnums[Enums.ARMS] = 'arms';
slotEnums[Enums.BACK] = 'back';
slotEnums[Enums.SHOULDERS] = 'shoulders';
slotEnums[Enums.CHEST] = 'chest';
slotEnums[Enums.WRIST1] = 'wrist';
slotEnums[Enums.WRIST2] = 'wrist';
slotEnums[Enums.HANDS] = 'hands';
slotEnums[Enums.FINGER1] = 'finger';
slotEnums[Enums.FINGER2] = 'finger';
slotEnums[Enums.WAIST] = 'waist';
slotEnums[Enums.LEGS] = 'legs';
slotEnums[Enums.FEET] = 'feet';
slotEnums[Enums.TRINKET1] = 'trinket';
slotEnums[Enums.TRINKET2] = 'trinket';
slotEnums[Enums.MAIN] = 'main';
slotEnums[Enums.SECONDARY] = 'secondary';
slotEnums[Enums.RANGED] = 'ranged';
slotEnums[Enums.AMMO] = 'ammo';
slotEnums[Enums.BAG1] = 'bag';
slotEnums[Enums.BAG2] = 'bag';
slotEnums[Enums.BAG3] = 'bag';
slotEnums[Enums.BAG4] = 'bag';

(function(window) {

    var Item = function(){
        return {
            id: null,
            name: null,

            value: null,
            weight: null,
            flavorText: null,
            resource: null,
            quantity: null,
            lore: null,
            stackable: null,

            slots: null,
            eqData: null,

            flipped: null,
            position: null,
            size: null,

            bag: null,

            init: function(data){
                console.log(data);
                this.id = data[Enums.ID];
                this.itemid = data[Enums.ITEMID];
                this.name = data[Enums.NAME];
                this.value = data[Enums.VALUE];
                this.weight = data[Enums.WEIGHT];
                this.flavorText = data[Enums.FLAVORTEXT];
                this.resource = data[Enums.RESOURCE];
                this.quantity = data[Enums.QUANTITY];
                this.lore = data[Enums.LORE];
                this.magic = data[Enums.MAGIC];
                this.twoHanded = data[Enums.TWOHANDED];
                this.stackable = data[Enums.STACK];

                this.bagSize = data[Enums.BAGSIZE];

                if (typeof data[Enums.SLOTS] != 'undefined'){
                    this.slots = data[Enums.SLOTS];
                    this.bludgeon = data[Enums.BLUDGEON];
                    this.pierce = data[Enums.PIERCE];
                    this.slash = data[Enums.SLASH];
                    this.onEquipText = data[Enums.ONEQUIPTEXT];
                    this.range = data[Enums.RANGE];
                    this.classes = data[Enums.CLASSES];
                    this.races = data[Enums.RACES];
                    this.ac = data[Enums.AC];
                    this.stats = data[Enums.STATS];
                }

                this.size = data[Enums.SIZE];

                this.sprite = Graphics.getSprite(this.resource);
                this.sprite.scale.x = (this.size[0]*32)/this.sprite.width;
                this.sprite.scale.y = (this.size[1]*32)/this.sprite.height;
                this.sprite.item = this;

                this.stackText = null;
                if (this.stackable){
                    this.stackText = new PIXI.Text(this.quantity,AcornSetup.style1);
                    this.stackText.style.fontSize = 14;
                    this.stackText.style.fill = 'white';
                    this.stackText.anchor.x = 1;
                    this.stackText.anchor.y = 1;
                }
            },

            setFlipped: function(b){
                this.flipped = b;
            },
            setPosition: function(p){
                this.position = p;
            },
            setBag: function(bag){
                this.bag = bag;
            },
            isEquipable: function(s){
                //return true;
                if (!this.slots){
                    Game.mainChat.addMessage('That item cannot be equipped!', 0xFFFF00);
                    return false;
                }
                var slotBool = false;
                for (var i = 0; i < this.slots.length;i++){
                    if (this.checkSlot(s,this.slots[i])){
                        slotBool = true;
                        break;
                    }
                }
                if (!slotBool){
                    Game.mainChat.addMessage('You cannot put that item there!', 0xFFFF00);
                    return false;
                }
                var cBool = false;
                var rBool = false;
                var char = Player.currentCharacter;
                for (var i = 0; i < this.classes.length;i++){
                    var c = this.classes[i].toLowerCase();
                    if (c == 'all' || c == char.class){
                        cBool = true;
                    }
                }
                for (var i = 0; i < this.races.length;i++){
                    var c = this.races[i].toLowerCase();
                    if (c == 'all' || c == char.race){
                        rBool = true;
                    }
                }
                if (!cBool || !rBool){
                    Game.mainChat.addMessage('Your race/class cannot equip that item!', 0xFFFF00);
                    return false;
                }
                if (s == Enums.SECONDARY){
                    if (Game.characterWindow.itemSlots[Enums.MAIN].item){
                        if (Game.characterWindow.itemSlots[Enums.MAIN].item.twoHanded){
                            Game.mainChat.addMessage('You are already using both hands!', 0xFFFF00);
                            return false;
                        }
                    }
                }
                if (s == Enums.MAIN && Game.characterWindow.itemSlots[Enums.SECONDARY].item){
                    if (this.twoHanded){
                        Game.mainChat.addMessage('That item requires both hands!', 0xFFFF00);
                        return false;
                    }
                }
                return true;
            },
            setQuantity: function(n){
                this.quantity = n;
                this.stackText.text = this.quantity;
            },
            checkSlot: function(itemSlot,slot){
                if (slotEnums[itemSlot] == slot){
                    return true;
                }
                return false;
            }
        }
    };
    window.Item = Item;
})(window);