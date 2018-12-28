
/*
    Chat Types

    Say
    Shout
    Party
    Guild
    Auction
    Zone
    Raid
    Tell / Whisper

    Channels???

    Other text types:

    Combat messages
    Server Messages

    Skill ups
    Exp gain
    AP Gain
    etc


*/

(function(window) {

    ChatWindow = function(){
        var chatWindow = new UiElement();
        chatWindow.init = function(data){
            this._init(data);
            this.maxItems = 150;
            //Required
                //data.main - is the main chat window (can be closed?)
            //optional
                //data.font
                //data.color
                //data.x
                //data.y
            this.main = data.main;

            this.active = false;
            this._active = false;
            this.textArr = [];
            this.upButton = null;
            this.downButton = null;
            this.textMask = null;
            this.textBox = null;
            this.spacing = 3
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

            this.resize(this.width,this.height);
            this.mainContainer.position.x = typeof data.x == 'undefined' ? 4 : data.x;
            this.mainContainer.position.y = typeof data.y == 'undefined' ? Graphics.height - 28 - this.height : data.y;
        };

        chatWindow.update = function(deltaTime){
            this._update(deltaTime);
        };
        chatWindow.move = function(x,y){
            this._move(x,y);
            this.checkBounds();
            if (this.mainContainer.position.y + this.height + this.textBox.height > Graphics.height){
                this.mainContainer.position.y = Graphics.height-this.height-this.textBox.height;
            }
            var yStart = this.height - this.spacing;
            for (var i = this.textArr.length-1; i >= 0;i--){
                yStart -= this.textArr[i].height;
                this.textArr[i].position.y = yStart;
                this.container.addChild(this.textArr[i]);
            }
        };
        chatWindow.resize = function(x,y){
            this._resize(x,y);

            this.mainContainer.removeChildren();
            this.container.removeChildren();
            this.gfx.clear();
            this.mainContainer.addChild(this.gfx);
            this.mainContainer.addChild(this.container);
            this.mainContainer.addChild(this.resizeRect);
            this.mainContainer.addChild(this.moveRect);
            this.nameBarSize = [this.width,25];
            this.font.wordWrapWidth = this.width - 6;
            this.moveRect.hitArea = new PIXI.Rectangle(this.nameBarSize[1],0,this.nameBarSize[0]-this.nameBarSize[1],this.nameBarSize[1]);
            this.resizeRect.hitArea = new PIXI.Rectangle(0,0,this.nameBarSize[1],this.nameBarSize[1]);


            this.textMask = new PIXI.Graphics();
            this.textMask.beginFill(0xFFFFFF,1);
            this.textMask.drawRect(0,this.nameBarSize[1],this.width,this.height);
            this.textMask.endFill();
            this.container.mask = this.textMask;
            this.container.addChild(this.textMask);

            this.textBox = new TextBox();
            this.textBox.init({
                id: this.id + 'textBox',
                width: this.width,
                height: 24,
                pos: [this.width/2,this.height],
                anchor: [0.5,0],
                container: this.mainContainer,
                font: '18px Verdana',
                bgColor: 0x000000,
                fontColor: 0xFFFFFF,
                name: '',
                letterOnly: false,
                onChange: function(box){
                },
                onConfirm: function(box){
                    //TODO should check for client side commands
                    if (Game.checkClientCommand(box.text)){
                        box.clear();
                        box.deactivate();
                        return;
                    }
                    var data = {};
                    data[Enums.COMMAND] = box.text;
                    Acorn.Net.socket_.emit(Enums.CLIENTCOMMAND,data);
                    box.clear();
                    box.deactivate();
                }

            });

            this.nameText = new PIXI.Text(this.name,AcornSetup.style1);
            this.nameText.style.fill = 0xFFFFFF;
            this.nameText.position.x = this.width/2;
            this.nameText.anchor.x = 0.5;
            this.nameText.position.y = this.nameBarSize[1]/2;
            this.nameText.anchor.y = 0.5;
            this.mainContainer.addChild(this.nameText);

            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(0x000000,0.5);
            this.gfx.drawRect(0,0,this.width,this.height);
            this.gfx.endFill();
            this.gfx.beginFill(this.color,1);
            this.gfx.drawRect(0,0,this.width,this.nameBarSize[1]);
            this.gfx.endFill();
 
        };
        chatWindow.setLock = function(b){
            this._setLock(b);  
        };
        chatWindow.addMessage = function(txt,color){
            var newText = new PIXI.Text(txt,this.font);
            newText.style.fill = color;
            newText.position.x = 5;
            for (var i = 0; i < this.textArr.length;i++){
                this.textArr[i].position.y -= newText.height;
            }
            if (this.textArr.length){
                newText.position.y = this.textArr[this.textArr.length-1].position.y + this.textArr[this.textArr.length-1].height;
            }else{
                newText.position.y = this.height - newText.height - this.spacing;
            }
            this.textArr.push(newText);
            this.container.addChild(newText);
        };
        chatWindow.scrollUp = function(){

        };

        chatWindow.scrollDown = function(){

        };
        chatWindow.activate = function(){
            this._activate();
        };
        chatWindow.deActivate = function(){
            this._deActivate();
        };
        return chatWindow;
    };


    window.ChatWindow = ChatWindow;
})(window);
