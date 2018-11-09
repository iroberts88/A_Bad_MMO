
(function(window) {

    BagWindow = function(){
        var bagWindow = new UiElement();
        bagWindow.init = function(data){
            this._init(data);

            this.currentBag = 0;

            this.bag0 = data.sData[Enums.BAG0];
            this.bag1 = data.sData[Enums.BAG1];
            this.bag2 = data.sData[Enums.BAG2];
            this.bag3 = data.sData[Enums.BAG3];
            this.bag4 = data.sData[Enums.BAG4];

            this.items = data[Enums.ITEMS];

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
        bagWindow.setBag = function(x,y){
            this.gfx.clear();
            this.container.removeChildren();
            //set width/height ect based on bag size
            //draw tabs/money display
            //draw grid!
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
