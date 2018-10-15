
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

            hd: null,
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

                this.speed = 125;
                this.moveVector = new SAT.Vector(0,0);

                this.sprite = Graphics.getSprite(this.spriteid + '_d1');
                this.sprite.anchor.x = 0.5;
                this.sprite.anchor.y = 0.6;
                this.sprite.scale.x = this.scale;
                this.sprite.scale.y = this.scale;
                this.sprite.position.x = Graphics.width/2;
                this.sprite.position.y = Graphics.height/2;
                this.hd = new SAT.Circle(new SAT.Vector(this.sprite.position.x,this.sprite.position.y),this.cRadius);
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
                this.sprite.position.x = this.hd.pos.x;
                this.sprite.position.y = this.hd.pos.y;
                this.currentTile = Game.map[Math.floor(this.hd.pos.x/mainObj.TILE_SIZE)][Math.floor(this.hd.pos.y/mainObj.TILE_SIZE)];
            },

            getDir: function(){
                if (this.moveVector.x >= this.diagM){
                    this.dir = 'r';
                    this.sprite.scale.x = this.scale;
                }else if (this.moveVector.x <= -this.diagM){
                    this.dir = 'r';
                    this.sprite.scale.x = -this.scale;
                }else if (this.moveVector.y <= -this.diagM){
                    this.dir = 'u';
                }else if (this.moveVector.y >= this.diagM){
                    this.dir = 'd';
                }
                this.sprite.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
            }
        }
    };
    window.Unit = Unit;
})(window);