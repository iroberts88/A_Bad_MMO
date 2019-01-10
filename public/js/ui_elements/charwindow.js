
(function(window) {

    CharWindow = function(){
        var charWindow = new UiElement();
        charWindow.init = function(data){
            this._init(data);
            this._setLock(false);
            this.itemSlots = {};

            var xStart = 92;
            var yStart = 58;
            this.itemSlots[Enums.EAR1] = new ItemSlot();
            this.itemSlots[Enums.EAR1].init({
                id: Enums.EAR1,
                name: 'EAR',
                parent: this.container,
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.FACE] = new ItemSlot();
            this.itemSlots[Enums.FACE].init({
                id: Enums.FACE,
                parent: this.container,
                name: 'FACE',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.HEAD] = new ItemSlot();
            this.itemSlots[Enums.HEAD].init({
                id: Enums.HEAD,
                parent: this.container,
                name: 'HEAD',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.NECK] = new ItemSlot();
            this.itemSlots[Enums.NECK].init({
                id: Enums.NECK,
                parent: this.container,
                name: 'NECK',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.EAR2] = new ItemSlot();
            this.itemSlots[Enums.EAR2].init({
                id: Enums.EAR2,
                parent: this.container,
                name: 'EAR',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });            
            xStart = 34;
            yStart += 58;
            this.itemSlots[Enums.WRIST1] = new ItemSlot();
            this.itemSlots[Enums.WRIST1].init({
                id: Enums.WRIST1,
                parent: this.container,
                name: 'WRIST',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.BACK] = new ItemSlot();
            this.itemSlots[Enums.BACK].init({
                id: Enums.BACK,
                parent: this.container,
                name: 'BACK',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.SHOULDERS] = new ItemSlot();
            this.itemSlots[Enums.SHOULDERS].init({
                id: Enums.SHOULDERS,
                parent: this.container,
                name: 'SHOULDERS',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.CHEST] = new ItemSlot();
            this.itemSlots[Enums.CHEST].init({
                id: Enums.CHEST,
                parent: this.container,
                name: 'CHEST',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.ARMS] = new ItemSlot();
            this.itemSlots[Enums.ARMS].init({
                id: Enums.ARMS,
                parent: this.container,
                name: 'ARMS',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.HANDS] = new ItemSlot();
            this.itemSlots[Enums.HANDS].init({
                id: Enums.HANDS,
                parent: this.container,
                name: 'HANDS',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.WRIST2] = new ItemSlot();
            this.itemSlots[Enums.WRIST2].init({
                id: Enums.WRIST2,
                parent: this.container,
                name: 'WRIST',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart = 34;
            yStart += 58;
            this.itemSlots[Enums.FINGER1] = new ItemSlot();
            this.itemSlots[Enums.FINGER1].init({
                id: Enums.FINGER1,
                parent: this.container,
                name: 'FINGER',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.TRINKET1] = new ItemSlot();
            this.itemSlots[Enums.TRINKET1].init({
                id: Enums.TRINKET1,
                parent: this.container,
                name: 'TRINKET',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.WAIST] = new ItemSlot();
            this.itemSlots[Enums.WAIST].init({
                id: Enums.WAIST,
                parent: this.container,
                name: 'WAIST',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.LEGS] = new ItemSlot();
            this.itemSlots[Enums.LEGS].init({
                id: Enums.LEGS,
                parent: this.container,
                name: 'LEGS',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.FEET] = new ItemSlot();
            this.itemSlots[Enums.FEET].init({
                id: Enums.FEET,
                parent: this.container,
                name: 'FEET',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.TRINKET2] = new ItemSlot();
            this.itemSlots[Enums.TRINKET2].init({
                id: Enums.TRINKET2,
                parent: this.container,
                name: 'TRINKET',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart += 58;
            this.itemSlots[Enums.FINGER2] = new ItemSlot();
            this.itemSlots[Enums.FINGER2].init({
                id: Enums.FINGER2,
                parent: this.container,
                name: 'FINGER',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            });
            xStart = 121;
            yStart += 58;
            this.itemSlots[Enums.MAIN] = new ItemSlot();
            this.itemSlots[Enums.MAIN].init({
                id: Enums.MAIN,
                parent: this.container,
                name: 'MAIN',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            })
            xStart += 58;
            this.itemSlots[Enums.SECONDARY] = new ItemSlot();
            this.itemSlots[Enums.SECONDARY].init({
                id: Enums.SECONDARY,
                name: 'OFFHAND',
                parent: this.container,
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            })
            xStart += 58;
            this.itemSlots[Enums.RANGED] = new ItemSlot();
            this.itemSlots[Enums.RANGED].init({
                id: Enums.RANGED,
                parent: this.container,
                name: 'RANGED',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            })
            xStart += 58;
            this.itemSlots[Enums.AMMO] = new ItemSlot();
            this.itemSlots[Enums.AMMO].init({
                id: Enums.AMMO,
                parent: this.container,
                name: 'AMMO',
                width: 36,
                height: 36,
                xPos: xStart,
                yPos: yStart
            })
            xStart = 440;
            yStart = 58;
            this.itemSlots[Enums.BAG1] = new ItemSlot();
            this.itemSlots[Enums.BAG1].init({
                id: Enums.BAG1,
                parent: this.container,
                name: 'BAG1',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            yStart += 58;
            this.itemSlots[Enums.BAG2] = new ItemSlot();
            this.itemSlots[Enums.BAG2].init({
                id: Enums.BAG2,
                parent: this.container,
                name: 'BAG2',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            yStart += 58;
            this.itemSlots[Enums.BAG3] = new ItemSlot();
            this.itemSlots[Enums.BAG3].init({
                id: Enums.BAG3,
                parent: this.container,
                name: 'BAG3',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            yStart += 58;
            this.itemSlots[Enums.BAG4] = new ItemSlot();
            this.itemSlots[Enums.BAG4].init({
                id: Enums.BAG4,
                parent: this.container,
                name: 'BAG4',
                width: 48,
                height: 48,
                xPos: xStart,
                yPos: yStart
            });
            yStart += 34;
            xStart = 10;

            this.gfx.lineStyle(2,0x000000,1);
            this.gfx.moveTo(0,yStart)
            this.gfx.lineTo(this.width,yStart);
            var style1 = {
                font: '18px Lato',
                fill: Graphics.pallette.color1,
                align: 'left'
            }   
            var style2 = {
                font: '18px Lato',
                fill: 0xFFFFFF,
                align: 'left'
            }   
            yStart += 10;
            var tmp = yStart;
            this.statDisplays = {}
            var char = Player.currentCharacter;

            var stat = new PIXI.Text('Max Health: ',style1);
            var buffer = 150;
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.MAXHEALTH] = new PIXI.Text(char.maxHealth,style2);
            this.statDisplays[Enums.MAXHEALTH].position.x = xStart + buffer;
            this.statDisplays[Enums.MAXHEALTH].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.MAXHEALTH]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Max Energy: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.MAXENERGY] = new PIXI.Text(char.maxEnergy,style2);
            this.statDisplays[Enums.MAXENERGY].position.x = xStart + buffer;
            this.statDisplays[Enums.MAXENERGY].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.MAXENERGY]);
            yStart += stat.height + 15;
            var stat = new PIXI.Text('Strength: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.STRENGTH] = new PIXI.Text(char.strength,style2);
            this.statDisplays[Enums.STRENGTH].position.x = xStart + buffer;
            this.statDisplays[Enums.STRENGTH].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.STRENGTH]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Stamina: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.STAMINA] = new PIXI.Text(char.stamina,style2);
            this.statDisplays[Enums.STAMINA].position.x = xStart + buffer;
            this.statDisplays[Enums.STAMINA].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.STAMINA]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Dexterity: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.DEXTERITY] = new PIXI.Text(char.dexterity,style2);
            this.statDisplays[Enums.DEXTERITY].position.x = xStart + buffer;
            this.statDisplays[Enums.DEXTERITY].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.DEXTERITY]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Agility: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.AGILITY] = new PIXI.Text(char.agility,style2);
            this.statDisplays[Enums.AGILITY].position.x = xStart + buffer;
            this.statDisplays[Enums.AGILITY].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.AGILITY]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Intelligence: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.INTELLIGENCE] = new PIXI.Text(char.intelligence,style2);
            this.statDisplays[Enums.INTELLIGENCE].position.x = xStart + buffer;
            this.statDisplays[Enums.INTELLIGENCE].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.INTELLIGENCE]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Wisdom: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.WISDOM] = new PIXI.Text(char.wisdom,style2);
            this.statDisplays[Enums.WISDOM].position.x = xStart + buffer;
            this.statDisplays[Enums.WISDOM].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.WISDOM]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Perception: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.PERCEPTION] = new PIXI.Text(char.perception,style2);
            this.statDisplays[Enums.PERCEPTION].position.x = xStart + buffer;
            this.statDisplays[Enums.PERCEPTION].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.PERCEPTION]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Charisma: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.CHARISMA] = new PIXI.Text(char.charisma,style2);
            this.statDisplays[Enums.CHARISMA].position.x = xStart + buffer;
            this.statDisplays[Enums.CHARISMA].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.CHARISMA]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Luck: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.LUCK] = new PIXI.Text(char.luck,style2);
            this.statDisplays[Enums.LUCK].position.x = xStart + buffer;
            this.statDisplays[Enums.LUCK].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.LUCK]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Spirit: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.SPIRIT] = new PIXI.Text(char.spirit,style2);
            this.statDisplays[Enums.SPIRIT].position.x = xStart + buffer;
            this.statDisplays[Enums.SPIRIT].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.SPIRIT]);

            yStart = tmp;
            xStart = this.width/2 + 10;
            var stat = new PIXI.Text('AC: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.AC] = new PIXI.Text(char.ac,style2);
            this.statDisplays[Enums.AC].position.x = xStart + buffer;
            this.statDisplays[Enums.AC].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.AC]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Melee Attack: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.MELEEPOWER] = new PIXI.Text(char.meleePower,style2);
            this.statDisplays[Enums.MELEEPOWER].position.x = xStart + buffer;
            this.statDisplays[Enums.MELEEPOWER].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.MELEEPOWER]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Ranged Attack: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.RANGEDPOWER] = new PIXI.Text(char.rangedPower,style2);
            this.statDisplays[Enums.RANGEDPOWER].position.x = xStart + buffer;
            this.statDisplays[Enums.RANGEDPOWER].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.RANGEDPOWER]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Spell Power: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.SPELLPOWER] = new PIXI.Text(char.spellPower,style2);
            this.statDisplays[Enums.SPELLPOWER].position.x = xStart + buffer;
            this.statDisplays[Enums.SPELLPOWER].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.SPELLPOWER]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('Healing Power: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.HEALINGPOWER] = new PIXI.Text(char.healingPower,style2);
            this.statDisplays[Enums.HEALINGPOWER].position.x = xStart + buffer;
            this.statDisplays[Enums.HEALINGPOWER].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.HEALINGPOWER]);
            yStart += stat.height + 15;

            var stat = new PIXI.Text('SV Fire: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.FIRERES] = new PIXI.Text(char.fireRes,style2);
            this.statDisplays[Enums.FIRERES].position.x = xStart + buffer;
            this.statDisplays[Enums.FIRERES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.FIRERES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Frost: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.FROSTRES] = new PIXI.Text(char.frostRes,style2);
            this.statDisplays[Enums.FROSTRES].position.x = xStart + buffer;
            this.statDisplays[Enums.FROSTRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.FROSTRES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Earth: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.EARTHRES] = new PIXI.Text(char.earthRes,style2);
            this.statDisplays[Enums.EARTHRES].position.x = xStart + buffer;
            this.statDisplays[Enums.EARTHRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.EARTHRES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Wind: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.WINDRES] = new PIXI.Text(char.windRes,style2);
            this.statDisplays[Enums.WINDRES].position.x = xStart + buffer;
            this.statDisplays[Enums.WINDRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.WINDRES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Arcane: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.ARCANERES] = new PIXI.Text(char.arcaneRes,style2);
            this.statDisplays[Enums.ARCANERES].position.x = xStart + buffer;
            this.statDisplays[Enums.ARCANERES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.ARCANERES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Shock: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.SHOCKRES] = new PIXI.Text(char.shockRes,style2);
            this.statDisplays[Enums.SHOCKRES].position.x = xStart + buffer;
            this.statDisplays[Enums.SHOCKRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.SHOCKRES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Poison: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.POISONRES] = new PIXI.Text(char.poisonRes,style2);
            this.statDisplays[Enums.POISONRES].position.x = xStart + buffer;
            this.statDisplays[Enums.POISONRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.POISONRES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Disease: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.DISEASERES] = new PIXI.Text(char.diseaseRes,style2);
            this.statDisplays[Enums.DISEASERES].position.x = xStart + buffer;
            this.statDisplays[Enums.DISEASERES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.DISEASERES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Holy: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.HOLYRES] = new PIXI.Text(char.holyRes,style2);
            this.statDisplays[Enums.HOLYRES].position.x = xStart + buffer;
            this.statDisplays[Enums.HOLYRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.HOLYRES]);
            yStart += stat.height + 5;
            var stat = new PIXI.Text('SV Shadow: ',style1);
            stat.position.x = xStart;
            stat.position.y = yStart;
            this.container.addChild(stat);
            this.statDisplays[Enums.SHADOWRES] = new PIXI.Text(char.shadowRes,style2);
            this.statDisplays[Enums.SHADOWRES].position.x = xStart + buffer;
            this.statDisplays[Enums.SHADOWRES].position.y = yStart;
            this.container.addChild(this.statDisplays[Enums.SHADOWRES]);
            yStart += stat.height + 5;

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

            this.gfx.lineStyle(2,0x000000,0);
            this.gfx.beginFill(this.color,0.35);
            this.gfx.drawRect(0,0,this.width,this.height);
            this.gfx.endFill();
            this.gfx.beginFill(this.color,7);
            this.gfx.drawRect(0,0,this.width,this.nameBarSize[1]);
            this.gfx.endFill();

            this.nameText = new PIXI.Text(this.name + ', the level ' + Player.currentCharacter.level + ' ' + Player.currentCharacter.class,this.font);
            this.nameText.style.fill = 0xFFFFFF;
            this.nameText.position.x = this.width/2;
            this.nameText.anchor.x = 0.5;
            this.nameText.position.y = this.nameBarSize[1]/2;
            this.nameText.anchor.y = 0.5;
            this.mainContainer.addChild(this.nameText);

            this.mainContainer.removeChild(this.resizeRect);
            this.resizeRect = null;

            this.resize(this.width,this.height);
            this.mainContainer.position.x = typeof data.x == 'undefined' ? 4 : data.x;
            this.mainContainer.position.y = typeof data.y == 'undefined' ? Graphics.height - 28 - this.height : data.y;
        };
        charWindow.update = function(deltaTime){
            this._update(deltaTime);
        };
        charWindow.move = function(x,y){
            this._move(x,y);
            this.checkBounds();
        };
        charWindow.resize = function(x,y){
        };
        charWindow.setLock = function(b){
            this._setLock(b);
        };
        charWindow.activate = function(){
            this._activate();
        };
        charWindow.deActivate = function(){
            this._deActivate();
            if (Game.currentToolTip){
                Game.currentToolTip.parent.removeChild(Game.currentToolTip);
                Game.currentToolTip = null;
            }
        };
        return charWindow;
    };


    window.CharWindow = CharWindow;
})(window);
