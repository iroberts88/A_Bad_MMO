
(function(window) {

    var UiElement = function(){
        return {
            id: null,
            name: null,
            locked: null,
            mainContainer: null,
            gfx: null,
            container: null,
            width: null,
            height: null,
            maxWidth: null,
            maxHeight: null,
            minWidth: null,
            minWidth: null,

            moveRect: null,
            resizeRect: null,

            nameBarSize: null,

            _init: function(data){
                this.id = data.id;
                this.name = data.name;
                this.locked = data.locked;
                this.width = data.width;
                this.height = data.height;
                this.maxHeight = typeof data.maxHeight == 'undefined' ? this.height : data.maxHeight;
                this.maxWidth = typeof data.maxWidth == 'undefined' ? this.width : data.maxWidth;
                this.minHeight = typeof data.minHeight == 'undefined' ? this.height : data.minHeight;
                this.minWidth = typeof data.minWidth == 'undefined' ? this.width : data.minWidth;

                this.width = Math.min(this.maxWidth,Math.max(this.minWidth,this.width));
                this.height = Math.min(this.maxHeight,Math.max(this.minHeight,this.height));

                this.nameBarSize = [this.width,this.height*0.1];
                this.mainContainer = new PIXI.Container();
                this.gfx = new PIXI.Graphics();
                this.container = new PIXI.Container();

                this.moveRect = Graphics.getSprite('empty');
                this.moveRect.position.x = this.nameBarSize[1];
                this.moveRect.interactive = true,
                this.moveRect.hitArea = new PIXI.Rectangle(this.nameBarSize[1],0,this.nameBarSize[0]-this.nameBarSize[1],this.nameBarSize[1]);
                this.moveRect.uiElement = this;
                this.resizeRect = Graphics.getSprite('empty');
                this.resizeRect.interactive = true,
                this.resizeRect.hitArea = new PIXI.Rectangle(0,0,this.nameBarSize[1],this.nameBarSize[1]);
                this.resizeRect.uiElement = this;

                var onClick = function(e){
                    e.currentTarget.clicked = true;
                    e.currentTarget.localPositionForMove = e.data.getLocalPosition(e.currentTarget);
                }
                this.moveRect.on('pointerdown', onClick);
                var onClickUp = function(e){
                    e.currentTarget.clicked = false;
                }
                this.moveRect.on('pointerup', onClickUp);
                this.moveRect.on('pointerupoutside', onClickUp);
                var onMove = function(e){
                    if (e.target){
                        document.body.style.cursor = e.target.cursorType;
                    }else if (!e.currentTarget.clicked){
                        document.body.style.cursor = "default";
                    }
                    if (e.currentTarget.clicked){
                        var xPos = Acorn.Input.mouse.X/Graphics.actualRatio[0];
                        var yPos = Acorn.Input.mouse.Y/Graphics.actualRatio[1];
                        xPos -= (e.currentTarget.localPositionForMove.x + e.currentTarget.position.x);
                        yPos -= e.currentTarget.localPositionForMove.y;
                        e.currentTarget.uiElement.move(xPos,yPos)
                    }
                }
                this.moveRect.on('pointermove', onMove);


                var onClick = function(e){
                    e.currentTarget.clicked = true;
                    e.currentTarget.localPositionForResize = e.data.getLocalPosition(e.currentTarget);
                    e.currentTarget.rsPos = {
                        x: e.currentTarget.uiElement.mainContainer.position.x+e.currentTarget.localPositionForResize.x,
                        y: e.currentTarget.uiElement.mainContainer.position.y+e.currentTarget.localPositionForResize.y
                    }
                }
                this.resizeRect.on('pointerdown', onClick);
                var onClickUp = function(e){
                    e.currentTarget.clicked = false;
                }
                this.resizeRect.on('pointerup', onClickUp);
                this.resizeRect.on('pointerupoutside', onClickUp);
                var onMove = function(e){

                    if (e.target){
                        document.body.style.cursor = e.target.cursorType;
                    }else if (!e.currentTarget.clicked){
                        document.body.style.cursor = "default";
                    }

                    if (e.currentTarget.clicked){
                        var xDiff = (e.currentTarget.rsPos.x) - (Acorn.Input.mouse.X/Graphics.actualRatio[0]);
                        var yDiff = (e.currentTarget.rsPos.y) - (Acorn.Input.mouse.Y/Graphics.actualRatio[1]);
                        console.log(xDiff + ', ' + yDiff);
                        var oldSize = [e.currentTarget.uiElement.width,e.currentTarget.uiElement.height];
                        e.currentTarget.uiElement.resize(Math.round(xDiff+e.currentTarget.uiElement.width),Math.round(yDiff+e.currentTarget.uiElement.height));
                        e.currentTarget.rsPos = {
                            x: (Acorn.Input.mouse.X/Graphics.actualRatio[0]),
                            y: (Acorn.Input.mouse.Y/Graphics.actualRatio[1])
                        }
                        var newSize = [e.currentTarget.uiElement.width,e.currentTarget.uiElement.height];
                        e.currentTarget.uiElement.move(e.currentTarget.uiElement.mainContainer.position.x + oldSize[0]-newSize[0],e.currentTarget.uiElement.mainContainer.position.y += oldSize[1]-newSize[1]);
                    }
                }
                this.resizeRect.on('pointermove', onMove);

                this.moveRect.cursorType = 'move';
                this.resizeRect.cursorType = 'se-resize';
                this.mainContainer.addChild(this.gfx);
                this.mainContainer.addChild(this.container);
                this.mainContainer.addChild(this.resizeRect);
                this.mainContainer.addChild(this.moveRect);
            },

            _update: function(dt){
                
            },

            _move: function(x,y){
                this.mainContainer.position.x = x;
                this.mainContainer.position.y = y;
            },

            _resize: function(w,h){
                this.width = Math.min(this.maxWidth,Math.max(this.minWidth,w));
                this.height = Math.min(this.maxHeight,Math.max(this.minHeight,h));
            },

            _setLock: function(b){
                this.locked = b;
                if (b){
                    this.resizeRect.interactive = false;
                    this.moveRect.interactive = false;
                }else{
                    this.resizeRect.interactive = true;
                    this.moveRect.interactive = true;
                }
            },

            _activate: function(){
                this.active = true;
                if (this.mainContainer.parent){
                    this.mainContainer.parent.removeChild(this.mainContainer);
                }
                Graphics.uiContainer.addChild(this.mainContainer);
            },

            _deActivate: function(){
                this.active = false
                if (this.mainContainer.parent){
                    this.mainContainer.parent.removeChild(this.mainContainer);
                }
            },

            checkBounds: function(){
                if (this.mainContainer.position.x < 0){
                    this.mainContainer.position.x = 0;
                }else{
                    if (this.mainContainer.position.x + this.width > Graphics.width){
                        this.mainContainer.position.x = Graphics.width-this.width;
                    }
                }
                if (this.mainContainer.position.y < 0){
                    this.mainContainer.position.y = 0;
                }else{
                    if (this.mainContainer.position.y + this.height > Graphics.height){
                        this.mainContainer.position.y = Graphics.height-this.height;
                    }
                }
            }

        }
    };
    window.UiElement = UiElement;
})(window);