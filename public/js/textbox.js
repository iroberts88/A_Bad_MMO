
(function(window) {

    var TextBox = function(){
        this.id = null;

        this.active = false;
        this._active = false;
    	this.width = null;
    	this.height = null;
    	this.font = null

    	this.ticker = 0;
    	this.c = null;
    	this.gfx = null;
        this.gfx2 = null;
    	this.textSprite = null;
    	this.text = '';

        this.pointerOver = false;
        this.letterOnly = null;
        this.atMax = false;
        this.letters = {};

        this.onChange = null;
    };

    TextBox.prototype.init = function(data) {
        var lStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < lStr.length;i++){
            this.letters[lStr.charAt(i)] = true;
        }
        this.id = data.id;
        this.width = data.width;
        this.height = data.height;
        this.maxLength = typeof data.max == 'undefined' ? 280 : data.max;
        this.letterOnly = typeof data.letterOnly == 'undefined' ? false : data.letterOnly;
        this.onChange = typeof data.onChange == 'undefined' ? function(){} : data.onChange;
        this.font = data.font;
    	this.container = data.container;
    	this.name = data.name;
    	this.c = new PIXI.Container();
    	this.c.interactive = true;
    	this.c.textBox = this;
        this.c.position.x = data.pos[0];
        this.c.position.y = data.pos[1];
        this.c.position.x -= (data.anchor[0]*this.width);
        this.c.position.y -= (data.anchor[1]*this.height);
    	this.c.hitArea = new PIXI.Rectangle(0,0,this.width,this.height);
    	this.c.on('pointerup', function(e){
            e.currentTarget.textBox.activate();
        });
        this.c.on('pointerout', function(e){
            e.currentTarget.textBox.pointerOver = false;
        })
        this.c.on('pointerover', function(e){
            e.currentTarget.textBox.pointerOver = true;
        })
        this.gfx = new PIXI.Graphics();
    	this.gfx2 = new PIXI.Graphics();
    	this.textSprite = new PIXI.Text('',{font:this.font,fill: 'black'});
    	this.textSprite.anchor.x = 0;
    	this.textSprite.anchor.y = 0.5;
    	this.textSprite.position.x = 5;
    	this.textSprite.position.y = this.height/2;
        this.c.addChild(this.gfx);
    	this.c.addChild(this.gfx2);
    	this.c.addChild(this.textSprite);
        this.gfx.lineStyle(2,0x000000,1);
        this.gfx.beginFill(0xFFFFFF,1)
       	this.gfx.drawRect(0,0,this.width,this.height);
        this.gfx.endFill();

        this.container.addChild(this.c);

        Graphics.textBoxes[this.id] = this;
    };

    TextBox.prototype.update = function(deltaTime){
        if (this.active){
            this.ticker += deltaTime;
            if (this.ticker > 0.4){
                if (this._active){
                    this.gfx2.clear();
                    this._active = false;
                }else{
                    this.drawLine();
                    this._active = true;
                }
                this.ticker = this.ticker - 0.4
            }
            while(this.textSprite.width >= this.width-10){
                this.textSprite.text = this.textSprite.text.substring(1,this.textSprite.text.length);
            }
        }
    },

    TextBox.prototype.keyDown = function(key){
        console.log(key);
        if (this.active){
            switch(key){
                case 8: //backspace
                    this.addToText('undo');
                    break;
                case 46: //delete
                    this.addToText('undo');
                    break;
                case 27: //escape
                    this.text = '';
                    this.addToText('');
                    break;
                case 32: //space
                    this.addToText(' ');
                    break;
            }
            this.onChange();
        }
    },
    TextBox.prototype.keyPress = function(key){
        if(this.active) {
            if(key !== 13) {
                this.addToText(String.fromCharCode(key));
            }
            this.onChange();
        }
    }

    TextBox.prototype.addToText = function(char){
        if (char == 'undo'){
            this.text = this.text.substring(0, this.text.length-1);
        }else{
            if(this.letterOnly){
                if (typeof this.letters[char] != 'undefined'){
                    this.text += char;
                }
            }else{
                this.text += char;
            }
        }
        if (this.text.length > this.maxLength){
            this.text = this.text.substring(0,this.text.length-1);
            this.atMax = true;
        }else{
            this.atMax = false;
        }
        this.textSprite.text = this.name + this.text;
        this.gfx2.clear();
        this.drawLine();
    }

    TextBox.prototype.drawLine = function(){
        var x = this.textSprite.position.x+this.textSprite.width+2;          
        if (this.text == ''){
            x = this.textSprite.position.x+2;
        }
        this.gfx2.lineStyle(1,0x000000,1);
        this.gfx2.moveTo(x,this.textSprite.position.y-this.textSprite.height/2);
        this.gfx2.lineTo(x,this.textSprite.position.y+this.textSprite.height/2);
    }

    TextBox.prototype.activate = function(){
        console.log("activate!!")
        if (this.active){
            return;
        }
    	this.active = true;
        if (Graphics.currentTextBox){
    	   Graphics.textBoxes[Graphics.currentTextBox].active = false;
        }
    	Graphics.currentTextBox = this.id;
    }

    TextBox.prototype.deactivate = function(){
        console.log('deactivate')
    	this.active = false;
        //this.textSprite.text = '';
        this.gfx2.clear();
        //should check if the pointer collides with any other text boxes???..
    	Graphics.currentTextBox = null;
    }

    window.TextBox = TextBox;
})(window);
