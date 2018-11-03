
(function(window) {

    UnitStatusBar = function(){
        var unitStatusBar = new UiElement();
        unitStatusBar.init = function(data){
            this._init(data);
            //Required
                //data.unit the unit this is displaying
            //optional
                //data.font
                //data.color
                //data.x
                //data.y
            
            this.unit = data.unit;

            this.redraw = false;

            var defaultFont = {
                font: '24px Lato',
                fill: 0xFFFFFF,
            }
            this.font = typeof data.font == 'undefined' ? defaultFont : data.font;


            this.mainContainer.position.x = typeof data.x == 'undefined' ? 4 : data.x;
            this.mainContainer.position.y = typeof data.y == 'undefined' ? Graphics.height - 28 - this.height : data.y;

            this.resize(this.width,this.height);
        };

        unitStatusBar.update = function(deltaTime){
            this._update(deltaTime);
        };
        unitStatusBar.move = function(x,y){
            this._move(x,y);
            this.checkBounds();
        };
        unitStatusBar.setLock = function(b){
            this._setLock(b);  
        };
        unitStatusBar.resize = function(x,y){
            this._resize(x,y);
            this.mainContainer.removeChildren();
            this.container.removeChildren();
            this.gfx.clear();
            this.mainContainer.addChild(this.gfx);
            this.mainContainer.addChild(this.container);
            this.mainContainer.addChild(this.resizeRect);
            this.mainContainer.addChild(this.moveRect);
            this.nameBarSize = [this.width,18];

            this.moveRect.hitArea = new PIXI.Rectangle(this.nameBarSize[1],0,this.nameBarSize[0]-this.nameBarSize[1],this.nameBarSize[1]);
            this.resizeRect.hitArea = new PIXI.Rectangle(0,0,this.nameBarSize[1],this.nameBarSize[1]);

            //create the PIXI container for this chat window.
            this.nameText = new PIXI.Text(this.unit.name,AcornSetup.style1);
            this.nameText.style.fill = 0xFFFFFF;
            this.nameText.position.x = 20;
            this.nameText.anchor.x = 0.0;
            this.nameText.position.y = this.nameBarSize[1]/2;
            this.nameText.anchor.y = 0.5;
            Graphics.fitText(this.nameText,this.width-5,this.nameBarSize[1]*2);
            this.mainContainer.addChild(this.nameText);

            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(this.color,0.35);
            this.gfx.drawRect(0,0,this.width,this.height);
            this.gfx.endFill();
            this.gfx.beginFill(this.color,7);
            this.gfx.drawRect(0,0,this.width,this.nameBarSize[1]);
            this.gfx.endFill();
            var y = this.height*.38;
            var x = this.width*0.2;
            var ySize = this.height*0.25;
            var xSize = this.width*0.75;
            this.hpText = new PIXI.Text('HP',this.font);
            this.hpText.anchor.y = 0.5;
            this.hpText.position.y = y;
            this.hpText.position.x = 3;
            Graphics.fitText(this.hpText,this.width-xSize-12,ySize);
            this.container.addChild(this.hpText);
            this.hpValue = new PIXI.Text(this.unit.currentHealth + '/' + this.unit.maxHealth,this.font);
            this.hpValue.style.strokeThickness = 2;
            this.hpValue.anchor.y = 0.5;
            this.hpValue.anchor.x = 0.5;
            this.hpValue.position.y = y;
            this.hpValue.position.x = x + xSize/2;
            Graphics.fitText(this.hpValue,xSize/2,ySize);
            this.container.addChild(this.hpValue);
            var p = this.unit.currentHealth/this.unit.maxHealth;
            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(0xFF0000,1);
            this.gfx.drawRect(x,y-ySize/2,xSize*p,ySize);
            this.gfx.endFill();
            this.gfx.lineStyle(2,0xFFFFFF,0.5);
            this.gfx.drawRect(x,y-ySize/2,xSize,ySize);

            y = this.height*0.75;
            this.endText = new PIXI.Text('EN',this.font);
            this.endText.anchor.y = 0.5;
            this.endText.position.y = y;
            this.endText.position.x = 3;
            this.container.addChild(this.endText);
            Graphics.fitText(this.endText,this.width*0.175,ySize);
            this.endValue = new PIXI.Text(this.unit.currentEnergy + '/' + this.unit.maxEnergy,this.font);
            this.endValue.style.strokeThickness = 2;
            this.endValue.anchor.y = 0.5;
            this.endValue.anchor.x = 0.5;
            this.endValue.position.y = y;
            this.endValue.position.x = x + xSize/2;
            Graphics.fitText(this.endValue,xSize/2,ySize);
            this.container.addChild(this.endValue);
            var p = this.unit.currentEnergy/this.unit.maxEnergy;
            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(0xF9F900,1);
            this.gfx.drawRect(x,y-ySize/2,xSize*p,ySize);
            this.gfx.endFill();
            this.gfx.lineStyle(2,0xFFFFFF,0.5);
            this.gfx.drawRect(x,y-ySize/2,xSize,ySize);
        };
        unitStatusBar.activate = function(){
            this._activate();
        };
        unitStatusBar.deActivate = function(){
            this._deActivate();
        };
        return unitStatusBar;
    };


    window.UnitStatusBar = UnitStatusBar;
})(window);
