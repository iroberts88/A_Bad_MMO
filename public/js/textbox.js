
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
    	this.textSprite = null;
    	this.text = '';
    };

    TextBox.prototype.init = function(data) {
        this.id = data.id;
        this.width = data.width;
        this.height = data.height;
        this.font = data.font;
    	this.container = data.container;
    	this.name = data.name;
    	this.c = new PIXI.Container();
    	this.c.interactive = true;
    	this.c.textBox = this;
    	this.c.hitArea = new PIXI.Rectangle(0,0,this.width,this.height);
    	this.c.on('pointerup', function(e){
    		console.log('CLICKED')
            e.currentTarget.textBox.active = true;
        });
        this.c.on('pointerupoutside',function(e){
            e.currentTarget.textBox.active = false;
        })
    	this.gfx = new PIXI.Graphics();
    	this.textSprite = new PIXI.Text('',{font:this.font,fill: 'black'});
    	this.textSprite.anchor.x = 0;
    	this.textSprite.anchor.y = 0.5;
    	this.textSprite.position.x = 5;
    	this.textSprite.position.y = this.height/2;
    	this.c.addChild(this.gfx);
    	this.c.addChild(this.textSprite);
        this.gfx.lineStyle(2,0x000000,1);
        this.gfx.beginFill(0xFFFFFF,1)
       	this.gfx.drawRect(0,0,this.width,this.height);
        this.gfx.endFill();
    };

    TextBox.prototype.update = function(deltaTime){
        if (this.active){
            this.ticker += deltaTime;
            if (this.ticker > 0.4){
                if (this._active){
                    this.textSprite.text = this.name + ': ' + this.text;
                    this._active = false;
                }else{
                    this.textSprite.text = this.name + ': ' + this.text + "_";
                    this._active = true;
                }
                this.ticker = this.ticker - 0.4
            }
        }
    }

    TextBox.prototype.activate = function(){
    	
    }

    TextBox.prototype.deactivate = function(){

    }

    window.TextBox = TextBox;
})(window);
