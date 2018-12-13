
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
            currentEnergy: null,
            maxEnergy: null,
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
            cRadius: 8,
            aTicker: null,
            enemy: false,
            diagM: 0.708,


            _init: function(data){
                this.enemy = false;
                this.id = data[Enums.ID];
                this.name = data[Enums.NAME];
                this.currentHealth = data[Enums.CURRENTHEALTH];
                this.maxHealth = data[Enums.MAXHEALTH];
                this.level = data[Enums.LEVEL];
                this.scale = data[Enums.SCALE];
                this.speed = data[Enums.SPEED];
                if (typeof data[Enums.RESOURCE] != 'undefined'){
                    this.spriteid = data[Enums.RESOURCE];
                }
                if (this.spriteid.substring(0,5) == 'enemy'){
                    this.enemy = true;
                }
                this.moveVector = new SAT.Vector(data[Enums.MOVEVECTOR][0],data[Enums.MOVEVECTOR][1]);

                if (this.enemy){
                    this.sprite = Graphics.getSprite(this.spriteid);
                }else{
                    this.sprite = Graphics.getSprite(this.spriteid + '_d1');
                }
                this.sprite.anchor.x = 0.5;
                this.sprite.anchor.y = 0.6;
                this.sprite.scale.x = this.scale;
                this.sprite.scale.y = this.scale;
                this.sprite.position.x = data[Enums.POSITION][0];
                this.sprite.position.y = data[Enums.POSITION][1];
                
                if (this.enemy){
                    this.sprite2 = Graphics.getSprite(this.spriteid);
                }else{
                    this.sprite2 = Graphics.getSprite(this.spriteid + '_d1');
                }
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
                    font: '14px Lato',
                    fill: 0x91d1ff,
                    align: 'left'
                };
                this.nameTag = new PIXI.Text(this.name, nameFont);
                this.nameTag.position.x = Math.round(this.sprite.position.x);
                this.nameTag.anchor.x = 0.5;
                this.nameTag.anchor.y = 1;
                this.nameTag.position.y = this.sprite.position.y - this.sprite.height*0.75;

                this.hb = new SAT.Circle(new SAT.Vector(this.sprite.position.x,this.sprite.position.y),this.cRadius);
                this._updateStats(data);
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
                if (!this.enemy){
                    this.sprite.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
                    this.sprite2.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
                }
            },
            _updateStats: function(data){
                for (var i in data){
                    var stat = this.setStat(i,data[i]);
                    if (stat != 'undefined'){
                        stat = data[i];
                    }
                }

            },
            setStat: function(e,val){
                switch(e){
                    case  Enums.AC:
                        this.ac = val;
                        break;
                    case  Enums.AGILITY:
                        this.agility = val;
                        break;
                    case  Enums.ARCANERES:
                        this.arcaneRes = val;
                        break;
                    case  Enums.CHARISMA:
                        this.charisma = val;
                        break; 
                    case  Enums.CURRENTHEALTH:
                        this.currentHealth = val;
                        break; 
                    case  Enums.MAXHEALTH:
                        this.maxHealth = val;
                        break;
                    case  Enums.DEXTERITY:
                        this.dexterity = val;
                        break; 
                    case  Enums.DISEASERES:
                        this.diseaseRes = val;
                        break; 
                    case  Enums.EARTHRES:
                        this.earthRes = val;
                        break; 
                    case  Enums.FIRERES:
                        this.fireRes = val;
                        break; 
                    case  Enums.FROSTRES:
                        this.frostRes = val;
                        break; 
                    case  Enums.HOLYRES:
                        this.holyRes = val;
                        break; 
                    case  Enums.LUCK:
                        this.luck = val;
                        break; 
                    case  Enums.MAXENERGY:
                        this.maxEnergy = val;
                        break; 
                    case  Enums.CURRENTENERGY:
                        this.currentEnergy = val;
                        break; 
                    case  Enums.CURRENTEXP:
                        this.currentExp = val;
                        break; 
                    case  Enums.POISONRES:
                        this.poisonRes = val;
                        break; 
                    case  Enums.PERCEPTION:
                        this.perception = val;
                        break; 
                    case  Enums.RANGEDPOWER:
                        this.rangedPower = val;
                        break; 
                    case  Enums.MELEEPOWER:
                        this.meleePower = val;
                        break; 
                    case  Enums.SPELLPOWER:
                        this.spellPower = val;
                        break; 
                    case  Enums.HEALINGPOWER:
                        this.healingPower = val;
                        break;
                    case  Enums.SHADOWRES:
                        this.shadowRes = val;
                        break; 
                    case  Enums.SHOCKRES:
                        this.shockRes = val;
                        break; 
                    case  Enums.SPEED:
                        this.speed = val;
                        break;
                    case  Enums.STRENGTH:
                        this.strength = val;
                        break; 
                    case  Enums.STAMINA:
                        this.stamina = val;
                        break; 
                    case  Enums.WINDRES:
                        this.windRes = val;
                        break;
                    case  Enums.WISDOM:
                        this.wisdom = val;
                        break; 
                    case  Enums.CURRENTWEIGHT:
                        this.currentWeight = val;
                        if (Game.bagWindow){
                            Game.bagWindow.draw();
                        }
                        break;
                    case  Enums.CARRYWEIGHT:
                        this.carryWeight = val;
                        if (Game.bagWindow){
                            Game.bagWindow.draw();
                        }
                        break;
                    case  Enums.INTELLIGENCE:
                        this.intelligence = val;
                        break; 
                    case  Enums.JUMPSPEED:
                        this.jumpSpeed = val;
                        break; 
                    case  Enums.JUMPTIME:
                        this.jumpTime = val;
                        break;
                    case  Enums.LEVEL:
                        this.level = val;
                        break;
                }
            }

        }
    };
    window.Unit = Unit;
})(window);