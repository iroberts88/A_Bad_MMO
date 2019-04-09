
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
            healthPercent: null,
            currentEnergy: null,
            maxEnergy: null,
            level: null,
            speed: null,
            race: null,
            class: null,
            sex: null,


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

            target: null, //the unit this unit currently has targeted

            nameFlash: {
                t: 0,
                del: 0.02,
                c: 1,
                c1: 0xFFFFFF,
                c2: 0x309bff,
                c3: 0xFF7777
            },

            nameFont:  {
                font: '14px Lato',
                fill: 0xFFFFFF,
                align: 'left'
            },

            stickToTarget: false,
            needToSetTarget: null,
            meleeHitbox: null,


            _init: function(data){
                console.log(data);
                this.enemy = false;
                this.id = data[Enums.ID];
                this.name = data[Enums.NAME];
                this.owner = data[Enums.OWNER];
                this.currentHealth = typeof data[Enums.CURRENTHEALTH] == 'undefined' ? null : data[Enums.CURRENTHEALTH];
                this.maxHealth = typeof data[Enums.MAXHEALTH] == 'undefined' ? null : data[Enums.MAXHEALTH];
                this.currentMana = typeof data[Enums.CURRENTMANA] == 'undefined' ? null : data[Enums.CURRENTMANA];
                this.maxMana = typeof data[Enums.MAXMANA] == 'undefined' ? null : data[Enums.MAXMANA];
                this.maxPercent = typeof data[Enums.HEALTHPERCENT] == 'undefined' ? null : data[Enums.HEALTHPERCENT];
                this.sex = typeof data[Enums.SEX] == 'undefined' ? 'm' : data[Enums.SEX];
                this.race = data[Enums.RACE];
                this.healthPercent = data[Enums.HEALTHPERCENT];
                this.level = data[Enums.LEVEL];
                this.scale = data[Enums.SCALE];
                this.speed = data[Enums.SPEED];
                if (typeof data[Enums.RESOURCE] != 'undefined'){
                    this.spriteid = data[Enums.RESOURCE];
                }
                if (this.spriteid.substring(0,5) == 'enemy'){
                    this.enemy = true;
                }else{
                    if (typeof this.race == 'undefined'){
                        this.spriteid = this.spriteid + this.sex;
                    }else{
                        this.spriteid = this.race + this.sex;
                    }
                }
                this.moveVector = new SAT.Vector(data[Enums.MOVEVECTOR][0],data[Enums.MOVEVECTOR][1]);
                this.stickToTarget = typeof data[Enums.STICK] == 'undefined' ? false : data[Enums.STICK];
                if (typeof data[Enums.TARGET] != 'undefined'){
                    //need to get a target!
                    this.needToSetTarget = data[Enums.TARGET];
                }
                this.faceVector = new SAT.Vector(1,0);

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

                
                var n = this.name;
                if (this.owner != Player.id){
                    n += '  L. ' + this.level;
                }
                this.nameTag = new PIXI.Text(n, this.nameFont);
                this.nameTag.position.x = Math.round(this.sprite.position.x);
                this.nameTag.anchor.x = 0.5;
                this.nameTag.anchor.y = 1;
                this.nameTag.position.y = this.sprite.position.y - this.sprite.height*0.75;

                var smSize = this.sprite.width;
                this.targetCircle = Graphics.getSprite('target_circle');
                this.targetCircle.anchor.x = 0.5;
                this.targetCircle.anchor.y = 0.5;
                this.targetCircle.position.x = this.sprite.position.x;
                this.targetCircle.position.y = this.sprite.position.y+this.sprite.height/5;
                this.targetCircle.scale.x = Math.max(.5,smSize/64);
                this.targetCircle.scale.y = Math.max(.5,smSize/64);
                this.hb = new SAT.Circle(new SAT.Vector(this.sprite.position.x,this.sprite.position.y),this.cRadius);

                this.hitBox = Graphics.getSprite('empty');
                this.hitBox.position.x = this.sprite.position.x;
                this.hitBox.position.y = this.sprite.position.y;
                this.hitBox.hitArea = new PIXI.Rectangle(Math.max(50,this.sprite.width)/2*-1,Math.max(50,this.sprite.height)/2*-1,Math.max(50,this.sprite.width),Math.max(50,this.sprite.height));
                this.hitBox.interactive = true;
                this.hitBox.buttonMode = true;
                this.hitBox.unit = this;
                var onClick = function(e){
                    console.log("set " + e.currentTarget.unit.name + ' as target!!!');
                    Player.setTarget(e.currentTarget.unit);
                }
                var onHover = function(e){
                    Game.unitHovered = true;
                }
                var onOut = function(e){
                    Game.unitHovered = false;
                }
                this.hitBox.on('pointerdown',onClick);
                this.hitBox.on('pointerover',onHover);
                this.hitBox.on('pointerout',onOut);

                this.meleeHitbox = new C(new V(this.hb.pos.x,this.hb.pos.y),this.sprite.width/2*this.scale);

                this._updateStats(data);
            },

            _update: function(dt){
                this.aTicker += dt;
                //check new target
                if (this.needToSetTarget){
                    if (typeof Game.allUnits[this.needToSetTarget] != 'undefined'){
                        this.setTarget(Game.allUnits[this.needToSetTarget]);
                        this.needToSetTarget = null;
                    }
                }
                //get direction
                if (this.stickToTarget && this.target){
                    var distance = Math.sqrt(Math.pow(this.hb.pos.x-this.target.meleeHitbox.pos.x,2)+Math.pow(this.hb.pos.y-this.target.meleeHitbox.pos.y,2));
                    if (distance > 50){
                        this.moveVector.x = this.target.hb.pos.x-this.hb.pos.x;
                        this.moveVector.y = this.target.hb.pos.y-this.hb.pos.y;
                        this.moveVector.normalize();
                    }else{
                        this.moveVector.x = 0;
                        this.moveVector.y = 0;
                    }
                }
                if (!this.moveVector.x == 0 || this.moveVector.y != 0){
                    Game.map.collideUnit(this,dt);
                    this.getDir();
                    if (this.aTicker > (400-this.speed)/1200){
                        this.aTicker = 0;
                        this.spritenum += 1;
                        if (this.spritenum == 3){this.spritenum = 1;}
                    }
                    this.faceVector.x = this.moveVector.x;
                    this.faceVector.y = this.moveVector.y;
                    this.faceVector.normalize();
                    this.targetCircle.rotation = Math.atan2(this.moveVector.y,this.moveVector.x) - (1.5708/2);
                }
                this.sprite.position.x = this.hb.pos.x;
                this.sprite.position.y = this.hb.pos.y;
                this.targetCircle.position.x = this.sprite.position.x;
                this.targetCircle.position.y = this.sprite.position.y+this.sprite.height/5;
                this.sprite2.position.x = this.hb.pos.x;
                this.sprite2.position.y = this.hb.pos.y;
                this.hitBox.position.x = this.hb.pos.x;
                this.hitBox.position.y = this.hb.pos.y;
                this.meleeHitbox.pos.x = this.hb.pos.x;
                this.meleeHitbox.pos.y = this.hb.pos.y;
                this.spriteMask.position.x = this.sprite2.position.x - this.sprite2.width/2;
                this.spriteMask.position.y = this.sprite2.position.y - this.sprite2.width*0.6;
                this.nameTag.position.x = this.sprite.position.x;
                this.nameTag.position.y = this.sprite.position.y - this.sprite.height*0.75;
                this.currentTile = Game.map[Math.floor(this.hb.pos.x/mainObj.TILE_SIZE)][Math.floor(this.hb.pos.y/mainObj.TILE_SIZE)];
                if (this.target){
                    var vec = new V(this.target.hb.pos.x-this.hb.pos.x,this.target.hb.pos.y-this.hb.pos.y).normalize();
                    this.targetCircle.rotation = Math.atan2(vec.y,vec.x) - (1.5708/2);
                    this.faceVector = vec;
                }
                if (Player.currentTarget == this){
                    this.nameFlash.t += dt;
                    if (this.nameFlash.t >= this.nameFlash.del){
                        this.nameFlash.t -= this.nameFlash.del;
                        if (this.nameFlash.c == 1){
                            this.nameFlash.c = 2;
                            if (Player.rangedAttackOn || Player.meleeAttackOn){
                                this.nameTag.style.fill = this.nameFlash.c3;
                            }else{
                                this.nameTag.style.fill = this.nameFlash.c2;
                            }
                        }else{
                            this.nameFlash.c = 1;
                            this.nameTag.style.fill = this.nameFlash.c1;
                        }
                    }
                }else{
                    this.nameTag.style.fill = this.nameFlash.c2;
                }
            },
            getDir: function(){
                if (this.faceVector.x >= this.diagM){
                    this.dir = 'r';
                    this.sprite.scale.x = this.scale;
                    this.sprite2.scale.x = this.scale;
                }else if (this.faceVector.x <= -this.diagM){
                    this.dir = 'r';
                    this.sprite.scale.x = -this.scale;
                    this.sprite2.scale.x = -this.scale;
                }else if (this.faceVector.y <= -this.diagM){
                    this.dir = 'u';
                }else if (this.faceVector.y >= this.diagM){
                    this.dir = 'd';
                }
                if (!this.enemy){
                    this.sprite.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
                    this.sprite2.texture = Graphics.getResource(this.spriteid + '_' + this.dir + this.spritenum);
                }
            },
            setTarget: function(unit){
                this.target = unit;
                if (Player.currentTarget == this){
                    Game.targetTargetStatus.unit = unit;
                    Game.targetTargetStatus.name = 'Target: ' + unit.name;
                    Game.targetTargetStatus.activate();
                    Game.targetTargetStatus.resize(Game.targetTargetStatus.width,Game.targetTargetStatus.height);
                }
                this.needToSetTarget = null;
            },
            clearTarget: function(){
                this.target = null;
                if (Player.currentTarget == this){
                    Game.targetTargetStatus.deActivate();
                }
                this.needToSetTarget = null;
            },
            _updateStats: function(data){
                for (var i in data){
                    this.setStat(i,data[i]);
                }

            },

            checkTargetStatus: function(){
                if (Player.currentCharacter == this){
                    Game.playerStatus.resize(Game.targetStatus.width,Game.targetStatus.height);
                }
                if (Player.currentTarget == this){
                    Game.targetStatus.resize(Game.targetStatus.width,Game.targetStatus.height);
                }
                if (Player.currentTarget){
                    if (Player.currentTarget.target == this){
                        Game.targetTargetStatus.resize(Game.targetStatus.width,Game.targetStatus.height);
                    }
                }
            },

            setStat: function(e,val){
                switch(parseInt(e)){
                    case Enums.AC:
                        this.ac = val;
                        break;
                    case Enums.AGILITY:
                        console.log("setting agilityds to " + val)
                        this.agility = val;
                        break;
                    case Enums.ARCANERES:
                        this.arcaneRes = val;
                        break;
                    case Enums.CHARISMA:
                        this.charisma = val;
                        break; 
                    case Enums.CURRENTHEALTH:
                        this.currentHealth = val;
                        this.checkTargetStatus();
                        break; 
                    case Enums.HEALTHPERCENT:
                        this.healthPercent = val;
                        this.checkTargetStatus();
                        break; 
                    case Enums.MAXHEALTH:
                        this.maxHealth = val;
                        this.checkTargetStatus();
                        break;
                    case Enums.DEXTERITY:
                        this.dexterity = val;
                        break; 
                    case Enums.DISEASERES:
                        this.diseaseRes = val;
                        break; 
                    case Enums.EARTHRES:
                        this.earthRes = val;
                        break; 
                    case Enums.FIRERES:
                        this.fireRes = val;
                        break; 
                    case Enums.FROSTRES:
                        this.frostRes = val;
                        break; 
                    case Enums.HOLYRES:
                        this.holyRes = val;
                        break; 
                    case Enums.LUCK:
                        this.luck = val;
                        break; 
                    case Enums.MAXENERGY:
                        this.maxEnergy = val;
                        this.checkTargetStatus();
                        break; 
                    case Enums.CURRENTENERGY:
                        this.currentEnergy = val;
                        this.checkTargetStatus();
                        break; 
                    case Enums.MAXMANA:
                        this.maxMana = val;
                        this.checkTargetStatus();
                        break; 
                    case Enums.CURRENTMANA:
                        this.currentMana = val;
                        this.checkTargetStatus();
                        break; 
                    case Enums.CURRENTEXP:
                        this.currentExp = val;
                        break; 
                    case Enums.POISONRES:
                        this.poisonRes = val;
                        break; 
                    case Enums.PERCEPTION:
                        this.perception = val;
                        break; 
                    case Enums.RANGEDPOWER:
                        this.rangedPower = val;
                        break; 
                    case Enums.MELEEPOWER:
                        this.meleePower = val;
                        break; 
                    case Enums.SPELLPOWER:
                        this.spellPower = val;
                        break; 
                    case Enums.HEALINGPOWER:
                        this.healingPower = val;
                        break;
                    case Enums.SHADOWRES:
                        this.shadowRes = val;
                        break; 
                    case Enums.SHOCKRES:
                        this.shockRes = val;
                        break; 
                    case Enums.SPEED:
                        this.speed = val;
                        break;
                    case Enums.SPIRIT:
                        this.spirit = val;
                        break;
                    case Enums.STRENGTH:
                        this.strength = val;
                        break; 
                    case Enums.STAMINA:
                        this.stamina = val;
                        break; 
                    case Enums.WINDRES:
                        this.windRes = val;
                        break;
                    case Enums.WISDOM:
                        this.wisdom = val;
                        break; 
                    case Enums.CURRENTWEIGHT:
                        this.currentWeight = val;
                        if (Game.bagWindow){
                            Game.bagWindow.draw();
                        }
                        break;
                    case Enums.CARRYWEIGHT:
                        this.carryWeight = val;
                        if (Game.bagWindow){
                            Game.bagWindow.draw();
                        }
                        break;
                    case Enums.INTELLIGENCE:
                        this.intelligence = val;
                        break; 
                    case Enums.JUMPSPEED:
                        this.jumpSpeed = val;
                        break; 
                    case Enums.JUMPTIME:
                        this.jumpTime = val;
                        break;
                    case Enums.LEVEL:
                        this.level = val;
                        this.checkTargetStatus();
                        try{
                            Game.characterWindow.nameText.text = Game.characterWindow.name + ', the level ' + Player.currentCharacter.level + ' ' + Player.currentCharacter.class
                        }catch(e){};
                        break;
                }
            }

        }

    };
    window.Unit = Unit;
})(window);