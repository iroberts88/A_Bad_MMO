
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

            this.items = data.sData[Enums.ITEMS];

            this.copper = data.sData[Enums.COPPER];
            this.silver = data.sData[Enums.SILVER];
            this.gold = data.sData[Enums.GOLD];
            this.platinum = data.sData[Enums.PLATINUM];

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


            this.mainContainer.removeChild(this.resizeRect);
            this.resizeRect = null;

            this.setBag(0);
            this.mainContainer.position.x = typeof data.x == 'undefined' ? 4 : data.x;
            this.mainContainer.position.y = typeof data.y == 'undefined' ? Graphics.height - 28 - this.height : data.y;
        };

        bagWindow.update = function(deltaTime){
            this._update(deltaTime);
        };
        bagWindow.move = function(x,y){
            this._move(x,y);
            this.checkBounds();
        };
        bagWindow.setBag = function(num){
            this.currentBag = num;
            this.gfx.clear();
            this.container.removeChildren();
            var cBh = 48;
            var nBh = 25;
            //set width/height ect based on bag size
            this.width = Math.max(324,this['bag'+num].x*32+50);
            this.height = Math.max(cBh+nBh+58*5,this['bag'+num].y*32+50);
            this.nameBarSize = [this.width,nBh];
            this.moveRect.hitArea = new PIXI.Rectangle(this.nameBarSize[1],0,this.nameBarSize[0]-this.nameBarSize[1],this.nameBarSize[1]);

            this.nameText = new PIXI.Text(this.name,AcornSetup.style1);
            this.nameText.style.fill = 0xFFFFFF;
            this.nameText.position.x = this.width/2;
            this.nameText.anchor.x = 0.5;
            this.nameText.position.y = this.nameBarSize[1]/2;
            this.nameText.anchor.y = 0.5;
            this.mainContainer.addChild(this.nameText);

            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(0x000000,0.15);
            this.gfx.drawRect(0,0,this.width,this.height);
            this.gfx.endFill();
            this.gfx.beginFill(this.color,1);
            this.gfx.drawRect(0,0,this.width,this.nameBarSize[1]);
            this.gfx.endFill();
            //draw tabs/money display
            var c = 0x000000;
            if (this.currentBag == 0){c = Graphics.pallette.color3}
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(c,0.3);
            this.gfx.drawRoundedRect(0,cBh+nBh,48,48,6);
            this.gfx.endFill();
            c = 0x000000;
            if (this.currentBag == 1){c = Graphics.pallette.color3}
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(c,0.15);
            this.gfx.drawRoundedRect(0,cBh+nBh+58,48,48,6);
            this.gfx.endFill();
            c = 0x000000;
            if (this.currentBag == 2){c = Graphics.pallette.color3}
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(c,0.15);
            this.gfx.drawRoundedRect(0,cBh+nBh+58*2,48,48,6);
            this.gfx.endFill();
            c = 0x000000;
            if (this.currentBag == 3){c = Graphics.pallette.color3}
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(c,0.15);
            this.gfx.drawRoundedRect(0,cBh+nBh+58*3,48,48,6);
            this.gfx.endFill();
            c = 0x000000;
            if (this.currentBag == 4){c = Graphics.pallette.color3}
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(c,0.15);
            this.gfx.drawRoundedRect(0,cBh+nBh+58*4,48,48,6);
            this.gfx.endFill();
            //draw grid!
            this.gfx.lineStyle(1,0xFFFFFF,1);
            this.gfx.beginFill(0x000000,1);
            this.gfx.drawRect(24,cBh+nBh,this.width-24,this.height-(cBh+nBh));
            this.gfx.endFill();
            //add items!
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
