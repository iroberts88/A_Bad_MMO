
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
                this.id = data[Enums.ID];
                this.itemid = data[Enums.ITEMID];
                this.name = data[Enums.NAME];
                this.value = data[Enums.VALUE];
                this.weight = data[Enums.WEIGHT];
                this.flavorText = data[Enums.FLAVORTEXT];
                this.resource = data[Enums.RESOURCE];
                this.quantity = data[Enums.QUANTITY];
                this.lore = data[Enums.LORE];
                this.stackable = data[Enums.STACK];

                if (typeof data[Enums.SLOTS] != 'undefined'){
                    this.eqData = {};
                    this.slots = data[Enums.slots];
                    this.eqData.bludgeon = data[Enums.BLUDGEON];
                    this.eqData.pierce = data[Enums.PIERCE];
                    this.eqData.slash = data[Enums.SLASH];
                    this.eqData.onEquipText = data[Enums.ONEQUIPTEXT];
                    this.eqData.range = data[Enums.RANGE];
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

            setQuantity: function(n){
                this.quantity = n;
                this.stackText.text = this.quantity;
            }
        }
    };
    window.Item = Item;
})(window);