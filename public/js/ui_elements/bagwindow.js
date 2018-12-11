
(function(window) {

    BagWindow = function(){
        var bagWindow = new UiElement();
        bagWindow.init = function(data){
            this._init(data);

            this.currentBag = 0;
            this.bag0 = data.sData[Enums.BAG];
            this.bag1 = data.sData[Enums.BAG1];
            this.bag2 = data.sData[Enums.BAG2];
            this.bag3 = data.sData[Enums.BAG3];
            this.bag4 = data.sData[Enums.BAG4];

            this.items = {};//data.sData[Enums.ITEMS];

            //dimensions for drawing grid
            this.cBh = 48; //coin bar height
            this.nBh = 25; //namebar height
            this.tileSize = 32 //grid tile size

            this.copper = data.sData[Enums.COPPER];
            this.silver = data.sData[Enums.SILVER];
            this.gold = data.sData[Enums.GOLD];
            this.platinum = data.sData[Enums.PLATINUM];

            this.gridTextures = {};

            this.active = false;
            this._active = false;
            this.color = typeof data.color == 'undefined' ? 0x000000 : data.color;
            var defaultFont = {
                font: '14px Lato',
                fill: Graphics.pallette.color1,
                align: 'left',
                wordWrap: true,
                wordWrapWidth: this.width-6,
                breakWords: true
            }
            this.font = typeof data.font == 'undefined' ? defaultFont : data.font;

            this.cpDisp = new PIXI.Text('CP: ' + this.copper,AcornSetup.style1);
            this.cpDisp.anchor.x = 0.5;
            this.cpDisp.anchor.y = 0.5;
            this.spDisp = new PIXI.Text('SP: ' + this.silver,AcornSetup.style1);
            this.spDisp.anchor.x = 0.5;
            this.spDisp.anchor.y = 0.5;
            this.gpDisp = new PIXI.Text('GP: ' + this.gold,AcornSetup.style1);
            this.gpDisp.anchor.x = 0.5;
            this.gpDisp.anchor.y = 0.5;
            this.ppDisp = new PIXI.Text('PP: ' + this.platinum,AcornSetup.style1);
            this.ppDisp.anchor.x = 0.5;
            this.ppDisp.anchor.y = 0.5;
            this.mainContainer.removeChild(this.resizeRect);
            this.resizeRect = null;

            var g1 = new PIXI.Graphics();
            g1.lineStyle(2,0xFFFFFF,0.5);
            g1.beginFill(0x000000,1);
            g1.drawRect(0,0,this.tileSize,this.tileSize);
            g1.endFill();

            this.gridTexture = PIXI.RenderTexture.create(this.tileSize,this.tileSize);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(g1,this.gridTexture);

            var g2 = new PIXI.Graphics();
            g2.lineStyle(2,0x000000,1);
            g2.beginFill(0x000000,1);
            g2.drawRect(0,0,this.tileSize,this.tileSize);
            g2.endFill();

            this.blankGridTexture = PIXI.RenderTexture.create(this.tileSize,this.tileSize);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(g2,this.blankGridTexture);

            this.outlineFilter = new PIXI.filters.OutlineFilter(2,0xFF0000);
            this.outlineFilter2 = new PIXI.filters.OutlineFilter(2,0x00FF00);
            this.outlineFilter3 = new PIXI.filters.OutlineFilter(2,0xFFFFFF);

            this.bag0Select = Graphics.getSprite('empty');
            this.bag0Select.interactive = true;
            this.bag0Select.buttonMode = true;
            this.bag0Select.hitArea = new PIXI.Rectangle(0,0,24,48);
            this.bag0Select.bagNum = 0;
            this.bag1Select = Graphics.getSprite('empty');
            this.bag1Select.interactive = true;
            this.bag1Select.buttonMode = true;
            this.bag1Select.hitArea = new PIXI.Rectangle(0,0,24,48);
            this.bag1Select.bagNum = 1;
            this.bag2Select = Graphics.getSprite('empty');
            this.bag2Select.interactive = true;
            this.bag2Select.buttonMode = true;
            this.bag2Select.hitArea = new PIXI.Rectangle(0,0,24,48);
            this.bag2Select.bagNum = 2;
            this.bag3Select = Graphics.getSprite('empty');
            this.bag3Select.interactive = true;
            this.bag3Select.buttonMode = true;
            this.bag3Select.hitArea = new PIXI.Rectangle(0,0,24,48);
            this.bag3Select.bagNum = 3;
            this.bag4Select = Graphics.getSprite('empty');
            this.bag4Select.interactive = true;
            this.bag4Select.buttonMode = true;
            this.bag4Select.hitArea = new PIXI.Rectangle(0,0,24,48);
            this.bag4Select.bagNum = 4;
            var onClick = function(e){
                Game.bagWindow.setBag(e.currentTarget.bagNum);
            }
            this.bag0Select.on('pointerdown', onClick);
            this.bag0Select.on('touchstart', onClick);
            this.bag1Select.on('pointerdown', onClick);
            this.bag1Select.on('touchstart', onClick);
            this.bag2Select.on('pointerdown', onClick);
            this.bag2Select.on('touchstart', onClick);
            this.bag3Select.on('pointerdown', onClick);
            this.bag3Select.on('touchstart', onClick);
            this.bag4Select.on('pointerdown', onClick);
            this.bag4Select.on('touchstart', onClick);

            this.itemContainer = new PIXI.Container();
            this.mainContainer.addChild(this.itemContainer);
            this.setBag(0);
            this.mainContainer.position.x = typeof data.x == 'undefined' ? 4 : data.x;
            this.mainContainer.position.y = typeof data.y == 'undefined' ? Graphics.height - 28 - this.height : data.y;
        
        };

        bagWindow.willFit = function(bag,tile,x,y){
            //check if the slot is empty
            for (var i = tile[0];i < tile[0]+x;i++){
                for (var j = tile[1];j < tile[1]+y;j++){
                    if (i >= bag.x || j >= bag.y){
                        return false;
                    }
                    if (bag.grid[i][j]){
                        return false;
                    }
                }
            }
            return true;
        }
        bagWindow.update = function(deltaTime){
            this._update(deltaTime);
        };
        bagWindow.move = function(x,y){
            this._move(x,y);
            this.checkBounds();
        };
        bagWindow.setBag = function(num){
            console.log('setting bag to ' + num)
            if (this.getBag(num) == null){return;}
            this.currentBag = num;
            if (num == 0){
                this.name = "Inventory - Main Bag";
            }else if (num == 1){
                this.name = "Inventory - Bag 1";
            }else if (num == 2){
                this.name = "Inventory - Bag 2";
            }else if (num == 3){
                this.name = "Inventory - Bag 3";
            }else if (num == 4){
                this.name = "Inventory - Bag 4";
            }
            this.gfx.clear();
            this.container.removeChildren();
            //set width/height ect based on bag size
            this.width = Math.max(324,this['bag'+num].x*this.tileSize+34);
            this.height = Math.max(this.cBh+this.nBh+58*5,this['bag'+num].y*this.tileSize+10+this.cBh+this.nBh);
            this.nameBarSize = [this.width,this.nBh];
            this.moveRect.hitArea = new PIXI.Rectangle(this.nameBarSize[1],0,this.nameBarSize[0]-this.nameBarSize[1],this.nameBarSize[1]);

            this.nameText = new PIXI.Text(this.name,AcornSetup.style1);
            this.nameText.style.fill = 0xFFFFFF;
            this.nameText.position.x = this.width/2;
            this.nameText.anchor.x = 0.5;
            this.nameText.position.y = this.nameBarSize[1]/2;
            this.nameText.anchor.y = 0.5;
            this.container.addChild(this.nameText);

            this.draw();

            //draw tabs/money display
            this.container.addChild(this.cpDisp);
            this.cpDisp.position.x = 324/5;
            this.cpDisp.position.y = this.nBh + this.cBh/2;
            this.container.addChild(this.spDisp);
            this.spDisp.position.x = 2*324/5;
            this.spDisp.position.y = this.nBh + this.cBh/2;
            this.container.addChild(this.gpDisp);
            this.gpDisp.position.x = 3*324/5;
            this.gpDisp.position.y = this.nBh + this.cBh/2;
            this.container.addChild(this.ppDisp);
            this.ppDisp.position.x = 4*324/5;
            this.ppDisp.position.y = this.nBh + this.cBh/2;


            this.bag0Select.position.y = this.cBh+this.nBh;
            this.bag1Select.position.y = this.cBh+this.nBh+58;
            this.bag2Select.position.y = this.cBh+this.nBh+58*2;
            this.bag3Select.position.y = this.cBh+this.nBh+58*3;
            this.bag4Select.position.y = this.cBh+this.nBh+58*4;
            this.container.addChild(this.bag0Select);
            this.container.addChild(this.bag1Select);
            this.container.addChild(this.bag2Select);
            this.container.addChild(this.bag3Select);
            this.container.addChild(this.bag4Select);

           
            var filtersOn = function (e) {
                if (Game.cursorItem){
                    var bag = Game.bagWindow.getBag(Game.bagWindow.currentBag);
                    var item = Game.cursorItem;
                    var xSize = Game.cursorItemFlipped ? item.size[1] : item.size[0];
                    var ySize = Game.cursorItemFlipped ? item.size[0] : item.size[1];
                    if (Game.bagWindow.willFit(bag,[e.currentTarget.xPos,e.currentTarget.yPos],xSize,ySize)){
                        e.currentTarget.filters = [Game.bagWindow.outlineFilter2];
                    }else{
                        e.currentTarget.filters = [Game.bagWindow.outlineFilter];
                    }
                }
                for (var i = -1;i < 2;i++){
                    for (var j = -1;j < 2;j++){
                        try{
                            var sprite = Game.bagWindow.gridTextures[e.currentTarget.xPos+i][e.currentTarget.yPos+j];
                            if (sprite.parent.getChildIndex(sprite) > sprite.parent.getChildIndex(e.currentTarget)){
                                sprite.parent.swapChildren(sprite,e.currentTarget);
                            }
                        }catch(e){
                        }
                    }
                }
            };

            var filtersOff = function(e) {
                e.currentTarget.filters = [];
            };
            var onClick = function(e){
                if (Game.cursorItem && e.data.originalEvent.which == 1){
                    var bag = Game.bagWindow.getBag(Game.bagWindow.currentBag);
                    var item = Game.cursorItem;
                    var xSize = Game.cursorItemFlipped ? item.size[1] : item.size[0];
                    var ySize = Game.cursorItemFlipped ? item.size[0] : item.size[1];
                    if (Game.bagWindow.willFit(bag,[e.currentTarget.xPos,e.currentTarget.yPos],xSize,ySize)){
                        if (typeof item.position == 'string'){
                            //the item is equipped - unequip it!
                            Game.characterWindow.itemSlots[item.position].item = null;
                        }
                        //add the item with new flip/position
                        Game.cursorItem.setPosition([e.currentTarget.xPos,e.currentTarget.yPos]);
                        Game.cursorItem.setFlipped(Game.cursorItemFlipped);
                        Game.cursorItem.setBag(bag);
                        item.sprite.interactive = true;
                        item.sprite.buttonMode = true;
                        Game.bagWindow.addItem(Game.cursorItem);
                        Game.cursorItem = null;
                        if (Game.previousPos[0] == item.position[0] && Game.previousPos[1] == item.position[1]){
                            //item hasnt actually moved
                            return;
                        }
                        var data = {};
                        data[Enums.COMMAND] = Enums.MOVEITEM;
                        data[Enums.ID] = item.id;
                        data[Enums.POSITION] = item.position;
                        data[Enums.FLIPPED] = item.flipped;
                        data[Enums.BAG] = item.bag.bag;
                        Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
                    }
                }
            }

            this.gridtextures = {};
            for (var i = 0; i < this['bag'+num][Enums.X];i++){
                this.gridTextures[i] = {};
                for (var j = 0; j < this['bag'+num][Enums.Y];j++){
                    this.gridTextures[i][j] = new PIXI.Sprite(this.gridTexture);
                    this.gridTextures[i][j].position.x = 29+i*this.tileSize;
                    this.gridTextures[i][j].position.y = 5+this.nBh+this.cBh+j*this.tileSize;
                    this.gridTextures[i][j].xPos = i;
                    this.gridTextures[i][j].yPos = j;
                    this.gridTextures[i][j].interactive = true;
                    this.gridTextures[i][j].buttonMode = true;
                    this.gridTextures[i][j].on('pointerover', filtersOn);
                    this.gridTextures[i][j].on('pointerout', filtersOff);
                    this.gridTextures[i][j].on('pointerup',onClick);
                    this.container.addChild(this.gridTextures[i][j]);
                }
            }
            //add items!
            for (var i in this.items){
                var item = this.items[i];
                if (item.bag[Enums.BAG] != num){
                    continue;
                }
                item.sprite.position.x = 29+item.position[0]*32;
                item.sprite.position.y = 5+this.nBh+this.cBh+item.position[1]*32;
                this.itemContainer.addChild(item.sprite);

                if (item.stackText){
                    this.itemContainer.addChild(item.stackText);
                    var xSize = item.flipped ? item.size[1] : item.size[0];
                    var ySize = item.flipped ? item.size[0] : item.size[1];
                    item.stackText.position.x = item.sprite.position.x + xSize*32;
                    item.stackText.position.y = item.sprite.position.y + ySize*32;
                }
                if (item.flipped){
                    item.sprite.rotation = -1.5708;
                    item.sprite.position.y += item.sprite.width;
                }
            }
        };
        bagWindow.draw = function(){

            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(0x000000,0.15);
            this.gfx.drawRect(0,0,this.width,this.height);
            this.gfx.endFill();
            this.gfx.beginFill(this.color,1);
            this.gfx.drawRect(0,0,this.width,this.nameBarSize[1]);
            this.gfx.endFill();

            var c = 0x000000;
            if (this.currentBag == 0){c = Graphics.pallette.color3}
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(c,0.3);
            this.gfx.drawRoundedRect(0,this.cBh+this.nBh,48,48,6);
            this.gfx.endFill();
            if (this.bag1){
                c = 0x000000;
                if (this.currentBag == 1){c = Graphics.pallette.color3}
                this.gfx.lineStyle(1,0xFFFFFF,1);
                this.gfx.beginFill(c,0.3);
                this.gfx.drawRoundedRect(0,this.cBh+this.nBh+58,48,48,6);
                this.gfx.endFill();
                this.bag1Select.interactive = true;
                this.bag1Select.buttonMode = true;
            }else{
                this.bag1Select.interactive = false;
                this.bag1Select.buttonMode = false;
            }


            if (this.bag2){
                c = 0x000000;
                if (this.currentBag == 2){c = Graphics.pallette.color3}
                this.gfx.lineStyle(1,0xFFFFFF,1);
                this.gfx.beginFill(c,0.3);
                this.gfx.drawRoundedRect(0,this.cBh+this.nBh+58*2,48,48,6);
                this.gfx.endFill();
                this.bag2Select.interactive = true;
                this.bag2Select.buttonMode = true;
            }else{
                this.bag2Select.interactive = false;
                this.bag2Select.buttonMode = false;
            }


            if (this.bag3){
                c = 0x000000;
                if (this.currentBag == 3){c = Graphics.pallette.color3}
                this.gfx.lineStyle(1,0xFFFFFF,1);
                this.gfx.beginFill(c,0.3);
                this.gfx.drawRoundedRect(0,this.cBh+this.nBh+58*3,48,48,6);
                this.gfx.endFill();
                this.bag3Select.interactive = true;
                this.bag3Select.buttonMode = true;
            }else{
                this.bag3Select.interactive = false;
                this.bag3Select.buttonMode = false;
            }

            if (this.bag4){
                c = 0x000000;
                if (this.currentBag == 4){c = Graphics.pallette.color3}
                this.gfx.lineStyle(1,0xFFFFFF,1);
                this.gfx.beginFill(c,0.3);
                this.gfx.drawRoundedRect(0,this.cBh+this.nBh+58*4,48,48,6);
                this.gfx.endFill();
                this.bag4Select.interactive = true;
                this.bag4Select.buttonMode = true;
            }else{
                this.bag4Select.interactive = false;
                this.bag4Select.buttonMode = false;
            }

            //draw grid!
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(0x000000,1);
            this.gfx.drawRect(24,this.cBh+this.nBh,this.width-24,this.height-(this.cBh+this.nBh));
            this.gfx.endFill();
        }
        bagWindow.removeItem = function(item){
            Game.bagWindow.itemContainer.removeChild(item.sprite);
            if (item.sprite.tooltip.sprite.parent){
                item.sprite.tooltip.sprite.parent.removeChild(item.sprite.tooltip.sprite);
            }
            item.sprite.interactive = false;
            item.sprite.buttonMode = false;
            if (item.stackText){
                this.itemContainer.removeChild(item.stackText);
            }
            var xSize = item.flipped ? item.size[1] : item.size[0];
            var ySize = item.flipped ? item.size[0] : item.size[1];
            for (var i = 0; i < xSize;i++){
                for (var j = 0; j < ySize;j++){
                    item.bag.grid[item.position[0]+i][item.position[1]+j] = null;
                }
            }
            delete this.items[item.id];

        };
        bagWindow.addItem = function(item){

            var xSize = item.flipped ? item.size[1] : item.size[0];
            var ySize = item.flipped ? item.size[0] : item.size[1];
            if (item.bag[Enums.BAG] == this.currentBag){
                item.sprite.position.x = 29+item.position[0]*32;
                item.sprite.position.y = 5+this.nBh+this.cBh+item.position[1]*32;
                this.itemContainer.addChild(item.sprite);
                if (item.flipped){
                    item.sprite.rotation = -1.5708;
                    item.sprite.position.y += item.sprite.width;
                }
            }
            if (item.stackText){
                this.itemContainer.addChild(item.stackText);
                item.stackText.position.x = 29+item.position[0]*32 + xSize*32;
                item.stackText.position.y = 5+this.nBh+this.cBh+item.position[1]*32 + ySize*32;
            }
            this.items[item.id] = item;
            for (var i = 0; i < xSize;i++){
                for (var j = 0; j < ySize;j++){
                    item.bag.grid[item.position[0]+i][item.position[1]+j] = item.id;
                }
            }
        };
        bagWindow.addNewItem = function(data){
            //new item data recieved from server
            var bag = this.getBag(data[Enums.BAG]);
            if (!bag){
                console.log('bag slot error');
                return null;
            }
            var item = new Item();
            item.init(data.item);
            item.setFlipped(data[Enums.FLIPPED]);
            item.setPosition(data[Enums.POSITION]);
            item.setBag(bag);
            //tooltip setup
            item.sprite.tooltip = new Tooltip();//tooltip setup
            item.sprite.tooltip.getItemTooltip(item,item.sprite);

            var onClick = function(e){
                var sprite = e.currentTarget;
                var item = sprite.item;
                if (Game.cursorItem){
                    //TODO try to swap items?
                    return;
                }
                console.log(e.data);
                console.log(e.data.button)
                if(e.data.button == 2){
                    for (var i in Game.characterWindow.itemSlots){
                        if (item.isEquipable(Game.characterWindow.itemSlots[i].id,false)){
                            if (Game.characterWindow.itemSlots[i].item == null){
                                var data = {};
                                data[Enums.COMMAND] = Enums.EQUIPITEM;
                                data[Enums.SLOT] = i;
                                data[Enums.ITEM] = item.id;
                                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
                                break;
                            }
                        }
                    }
                }else if (typeof item.position == 'string'){
                    //the item is equipped
                    Game.setCursorItem(item);
                }else if (Acorn.Input.isPressed(Acorn.Input.Key.MOD_SHIFT)){
                    //create chat link
                    console.log('eh');
                }else if (Acorn.Input.isPressed(Acorn.Input.Key.MOD_CTRL)){
                    //bring up split menu
                    console.log('eh2');
                }else{
                    Game.bagWindow.removeItem(item);
                    Game.setCursorItem(item);
                }
                var c = Game.bagWindow.gridTextures[item.position[0]][item.position[1]];
                c.texture = Game.bagWindow.gridTexture;
                c.filters = [];
                c.scale.x = 1;
                c.scale.y = 1;

            }
            item.sprite.on('pointerup',onClick);

            this.addItem(item);
        };
        bagWindow.setLock = function(b){
            this._setLock(b);  
        };
        bagWindow.activate = function(){
            this.active = true;
            if (this.mainContainer.parent){
                this.mainContainer.parent.removeChild(this.mainContainer);
            }
            Graphics.uiContainer.addChild(this.mainContainer);
        };

        bagWindow.getBag = function(num){
            switch(parseInt(num)){
                case 0:
                    return this.bag0;
                    break;
                case 1:
                    return this.bag1;
                    break;
                case 2:
                    return this.bag2;
                    break;
                case 3:
                    return this.bag3;
                    break;
                case 4:
                    return this.bag4;
                    break;
            }
            return null;
        }
        bagWindow.deActivate = function(){
            this.active = false
            if (this.mainContainer.parent){
                this.mainContainer.parent.removeChild(this.mainContainer);
            }
        };
        return bagWindow;
    };


    window.BagWindow = BagWindow;
})(window);
