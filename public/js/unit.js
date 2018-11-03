
var P = SAT.Polygon,
    C = SAT.Circle,
    V = SAT.Vector;

(function(window) {

    var Unit = function(){
        return {
            id: null,
            name: null,
            currentHealth: null,
            maxHealth: null,
            level: null,
            speed: null,
            race: null,
            class: null,

            spriteid: 'human',
            spritenum: 1,
            dir: 'd',
            sprite: null,
            scale: 2,

            hb: null,
            moveVector: null,
            mapCollide: true,
            cRadius: 16,

            aTicker: null,

            diagM: 0.7071067811865475,


            _init: function(data){
                this.id = data[Enums.ID];
                this.name = data[Enums.NAME];
                this.currentHealth = data[Enums.CURRENTHEALTH];
                this.maxHealth = data[Enums.MAXHEALTH];
                this.level = data[Enums.LEVEL];

                this.speed = data[Enums.SPEED];
                if (typeof data[Enums.RESOURCE] != 'undefined'){
                    this.spriteid = data[Enums.RESOURCE];
                }
                this.moveVector = new SAT.Vector(data[Enums.MOVEVECTOR][0],data[Enums.MOVEVECTOR][1]);

                this.sprite = Graphics.getSprite(this.spriteid + '_d1');
                this.sprite.anchor.x = 0.5;
                this.sprite.anchor.y = 0.6;
                this.sprite.scale.x = this.scale;
                this.sprite.scale.y = this.scale;
                this.sprite.position.x = data[Enums.POSITION][0];
                this.sprite.position.y = data[Enums.POSITION][1];
                
                this.sprite2 = Graphics.getSprite(this.spriteid + '_d1');
                this.sprite2.anchor.x = 0.5;
                this.sprite2.anchor.y = 0.6;
                this.sprite2.scale.x = this.scale;
                this.sprite2.scale.y = this.scale;
                this.sprite2.position.x = data[Enums.POSITION][0];
                this.sprite2.position.y = data[Enums.POSITION][1];

                this.spriteMask = new PIXI.Graphics();
                this.spriteMask.beginFill(0xFFFFFF,1);
                this.spriteMask.drawRect(0,0,this.sprite2.width,this.sprite2.height* 0.6);
                this.spriteMask.endFill();
                this.spriteMask.position.x = this.sprite2.position.x - this.sprite2.width/2;
                this.spriteMask.position.y = this.sprite2.position.y - this.sprite2.width*0.6;
                this.sprite2.mask = this.spriteMask;

                var nameFont =  {
                    font: '18px Lato',
                    fill: 0x91d1ff,
                    align: 'left'
                };
                this.nameTag = new PIXI.Text(this.name, nameFont);
                this.nameTag.position.x = Math.round(this.sprite.position.x);
                this.nameTag.anchor.x = 0.5;
                this.nameTag.anchor.y = 1;
                this.nameTag.position.y = this.sprite.position.y - this.sprite.height*0.75;

                this.hb = new SAT.Circle(new SAT.Vector(this.sprite.position.x,this.sprite.position.y),this.cRadius);
                this.updateStats(data);
            },

            _update: function(dt){
                this.aTicker += dt;
                //get direction
                if (!this.moveVector.x == 0 || this.moveVector.y != 0){
                    Game.map.collideUnit(this,dt);
                    this.getDir();
                    if (this.aTicker > (400-this.speed)/1200){
                        this.aTicker = 0;
                        this.spritenum += 1;
                        if (this.spritenum == 3){this.spritenum = 1;}
                    }
                }
                this.sprite.position.x = this.hb.pos.x;
                this.sprite.position.y = this.hb.pos.y;
                this.sprite2.position.x = this.hb.pos.x;
                this.sprite2.position.y = this.hb.pos.y;
                this.spriteMask.position.x = this.sprite2.position.x - this.sprite2.width/2;
                this.spriteMask.position.y = this.sprite2.position.y - this.sprite2.width*0.6;
                this.nameTag.position.x = this.sprite.position.x;
                this.nameTag.position.y = this.sprite.position.y - this.sprite.height*0.75;
                this.currentTile = Game.map[Math.floor(this.hb.pos.x/mainObj.TILE_SIZE)][Math.floor(this.hb.pos.y/mainObj.TILE_SIZE)];
            },

            getDir: function(){
                if (this.moveVector.x >= this.diagM){
                    this.dir = 'r';
                    this.sprite.scale.x = this.scale;
                    this.sprite2.scale.x = this.scale;
                }else if (this.moveVector.x <= -this.diagM){
                    this.dir = 'r';
                    this.sprite.scale.x = -this.scale;
                    this.sprite2.scale.x = -this.scale;
                }else if (this.moveVector.y <= -this.diagM){
                    this.dir = 'u';
                }else if (this.moveVector.y >= this.diagM){
                    this.dir = 'd';
                }
                this.sprite.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
                this.sprite2.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
            },
            updateStats: function(){

            }

        }
    };
    window.Unit = Unit;
})(window);