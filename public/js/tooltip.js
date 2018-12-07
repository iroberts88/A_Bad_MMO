(function(window) {
    var Tooltip = function(){
        this.maxWidth = 400;
        this.ttInfo = null;
        this.texture = null;
        this.sprite = null;
        this.style1 = {
            font: '14px Verdana', 
            fill: 'white', 
            align: 'left',
            wordWrap: true,
            wordWrapWidth: this.maxWidth
        };
        this.position = {
            x: 0,
            y: 0
        }
        this.numbers = {
            0: true,
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
            8: true,
            9: true,
        }
    };

    Tooltip.prototype.set = function(data){
        //set the texture, sprite and info of the tooltip
        this.ttInfo = data;
        //REQUIRED: data.ttArray [{text: "derp"}]
            //OPTIONS: color,fontSize, align, sprite????
        //OPTIONAL: data.bgFill
        if (typeof this.ttInfo.bgFill == 'undefined'){
            this.ttInfo.bgFill = 'black';
        }
        //OPTIONAL: data.alpha
        if (typeof this.ttInfo.alpha == 'undefined'){
            this.ttInfo.alpha = 1;
        }
        var w = 0;
        var h = 0;
        var padding = 5;
        var eHeight = 5; //extra height to add after each text object
        var lastHeight = 0;
        //create a new container for the tooltip
        var scene = new PIXI.Container();
        var cont = new PIXI.Container();
        var gfx = new PIXI.Graphics();
        gfx.beginFill(this.ttInfo.bgFill,this.ttInfo.alpha);
        gfx.drawRect(0,0,Graphics.width,Graphics.height);
        gfx.endFill();
        scene.addChild(gfx);
        scene.addChild(cont);
        
        var textObjects = [];
        var yStart = padding;
        for (var i = 0; i < this.ttInfo.ttArray.length;i++){
            //create the text object
            var start = 0;
            var text = this.ttInfo.ttArray[i].text;
            var xStart = padding;
            for (var sI = 0; sI < text.length; sI++){
                if (text.charAt(sI) == ' ' || sI == text.length-1){
                    //found word'
                    if (text.charAt(start) == '<' || text.charAt(start) == '{'){
                        var t= '';
                        for (var c = start; c < text.length; c++){
                            t = t + text.charAt(c);
                            if (text.charAt(c) == '>' || text.charAt(c) == '}'){
                                start = c+1;
                                sI = c;
                                var nextWord = new PIXI.Text(t,this.style1);
                                break;
                            }
                        }
                    }else if (text.charAt(start) == '('){
                        //ignore this
                        var t= '';
                        for (var c = start; c < text.length; c++){
                            if (text.charAt(c) == ')'){
                                start = c+1;
                                sI = c;
                                var nextWord = new PIXI.Text(t,this.style1);
                                break;
                            }
                        }
                    }else{
                        if (sI == text.length-1){
                            var nextWord = new PIXI.Text(text.slice(start),this.style1);
                        }else{
                            var nextWord = new PIXI.Text(text.slice(start,sI+1),this.style1);
                            start = sI+1;
                        }
                    }
                    //set the fontSize/color/align ETC
                    if (typeof this.ttInfo.ttArray[i].fontSize != 'undefined'){
                        nextWord.style.fontSize = this.ttInfottArray[i].fontSize;
                    }
                    if (typeof this.ttInfo.ttArray[i].color != 'undefined'){
                        nextWord.style.fill = this.ttInfo.ttArray[i].color;
                    }
                    if (nextWord.text.charAt(0) == '<'){
                        nextWord.style.fill = 0x42d7f4;
                        nextWord.text = nextWord.text.slice(1,nextWord.text.length-1) + '';
                    }else if (nextWord.text.charAt(0) == '{'){
                        nextWord.style.fill = 0x42f450;
                        nextWord.text = nextWord.text.slice(1,nextWord.text.length-1) + '';
                    }
                    nextWord.anchor.x = 0.5;
                    nextWord.anchor.y = 0.5;
                    nextWord.position.x = xStart + nextWord.width/2;
                    nextWord.position.y = yStart + nextWord.height/2;
                    xStart += nextWord.width;
                    if (xStart > this.maxWidth){
                        //move down a line
                        xStart = padding*2 + nextWord.width;
                        nextWord.position.x = padding + nextWord.width/2;
                        yStart += nextWord.height;
                        nextWord.position.y = yStart + nextWord.height/2;
                    }
                    if (nextWord.position.x + nextWord.width/2 > w){
                        w = nextWord.position.x + nextWord.width/2 + padding;
                    }
                    textObjects.push(nextWord);
                    cont.addChild(nextWord);
                    lastHeight = nextWord.height;
                }
            }
            yStart += lastHeight + eHeight;
            xStart = padding;
            //increment height and width
        }
        h = yStart + padding;
        //check alignment
        /*for (var j = 0; j < textObjects.length; j++){
            try{
                if (this.ttInfo.ttArray[j].align == 'center'){
                    textObjects[j].position.x = w/2;
                }else if(this.ttInfo.ttArray[j].align == 'right'){
                    textObjects[j].position.x = w-textObjects[j].width/2;
                }
            }catch(e){
                console.log(e);
            }
        }*/
        //draw outline
        gfx.lineStyle(3,0xFFFFFF,1);
        gfx.moveTo(2,2);
        gfx.lineTo(w+padding*2-2,2);
        gfx.lineTo(w+padding*2-2,h+padding*2-2);
        gfx.lineTo(2,h+padding*2-2);
        gfx.lineTo(2,2);
        //create and render the texture and sprite
        this.texture = PIXI.RenderTexture.create(w+padding*2,h+padding*2);
        var renderer = new PIXI.CanvasRenderer();
        Graphics.app.renderer.render(scene,this.texture);
        this.sprite = new PIXI.Sprite(this.texture);

        data.owner.tooltipAdded = false;

        this.position.x = Graphics.width - this.sprite.width - 5;
        this.position.y = Graphics.height - this.sprite.height - 5;
        var overFunc = function(e){
            if (!e.currentTarget.tooltipAdded){
                Graphics.uiContainer.addChild(e.currentTarget.tooltip.sprite);
                Game.currentToolTip = e.currentTarget.tooltip.sprite;
                e.currentTarget.tooltipAdded = true;
            }
            e.currentTarget.tooltip.sprite.position.x =  e.currentTarget.tooltip.position.x;
            e.currentTarget.tooltip.sprite.position.y =  e.currentTarget.tooltip.position.y;
        }
        var outFunc = function(e){
            if (e.currentTarget.tooltipAdded){
                Graphics.uiContainer.removeChild(e.currentTarget.tooltip.sprite);
                Game.currentToolTip = null;
                e.currentTarget.tooltipAdded = false;
            }
        }
        var moveFunc = function(e){
            var x = Acorn.Input.mouse.X/Graphics.actualRatio[0]+30;
            var y = Acorn.Input.mouse.Y/Graphics.actualRatio[1]+30;
            if (x+e.currentTarget.tooltip.sprite.width > Graphics.width){x = Graphics.width - e.currentTarget.tooltip.sprite.width-5}
            if (y+e.currentTarget.tooltip.sprite.height > Graphics.height){y = Graphics.height - e.currentTarget.tooltip.sprite.height-5}
            e.currentTarget.tooltip.sprite.position.x =  x;
            e.currentTarget.tooltip.sprite.position.y =  y;
        }
        data.owner.on('pointerover',overFunc);
        data.owner.on('pointermove',moveFunc);
        data.owner.on('touchmove',overFunc);
        data.owner.on('touchend', outFunc);
        data.owner.on('touchendoutside', outFunc);
        data.owner.on('pointerout', outFunc);
        data.owner.interactive = true;
        data.owner.buttonMode = true;
    }

    Tooltip.prototype.getItemTooltip = function(item,element){
        // element = the element containing the tooltip
        //item = the item to work on

        var ttArray = [{text: item.name}];
        ttArray.push({text: '<Weight>: ' + item.weight});
        //item lore/magic/2h/soulbind etc
        var string = '';
        if (item.lore){
            if (item.lore){
                string += '<Lore>';
            }
        }
        if (item.magic){
            if (string != ''){string += ' - ';}
            string += '<Magic>';
        }
        if (item.twoHanded){
            if (string != ''){string += ' - ';}
            string += '<2-Hands>';
        }
        if (string != ''){
            ttArray.push({text: string});
        }
        //item races and classes
        if (item.slots){
            var string = ''
            for (var i = 0; i < item.slots.length;i++){
                string += item.slots[i] + ' '
            }
            ttArray.push({text: string,color: 0xe7a5ff});

            if (item.ac){
                ttArray.push({text: '<AC: > ' + item.ac});
            }
            
            var races = '';
            for (var i = 0 ; i < item.races.length;i++){
                races += item.races[i] + ' ';
            }
            ttArray.push({text: '<Races:> ' + races});

            var classes = '';
            for (var i = 0 ; i < item.classes.length;i++){
                classes += item.classes[i] + ' ';
            }
            ttArray.push({text: '<Classes:> ' + classes});
            
            if (item.range){
                ttArray.push({text: '<Range: > ' + item.range});
            }

            if (item.bludgeon){
                ttArray.push({text: '<Bludgeon: > ' + item.bludgeon[0] + '/' + item.bludgeon[1] + ' ~ ' + item.bludgeon[2] + '%'});
            }

            if (item.slash){
                ttArray.push({text: '<Slash: > ' + item.slash[0] + '/' + item.slash[1] + ' ~ ' + item.slash[2] + '%'});
            }

            if (item.pierce){
                ttArray.push({text: '<Pierce: > ' + item.pierce[0] + '/' + item.pierce[1] + ' ~ ' + item.pierce[2] + '%'});
            }

            if (item.bagSize){
                ttArray.push({text: '<Bag Size: > ' + item.bagSize[0] + 'x' + item.bagSize[1]});
            }

            for (var i in item.stats){
                ttArray.push({text: i + ': ' + item.stats[i],color:Graphics.pallette.color1});
            }

        }
        if (item.flavorText){
            ttArray.push({text: '{' + item.flavorText + '}'});
        }

        element.tooltip.set({
            owner: element,
            ttArray: ttArray,
            alpha: 1
        });


        var overFunc = function(e){
            if (!e.currentTarget.tooltipAdded){
                Graphics.uiContainer.addChild(e.currentTarget.tooltip.sprite);
                Game.currentToolTip = e.currentTarget.tooltip.sprite;
                e.currentTarget.tooltipAdded = true;
            }
            e.currentTarget.tooltip.sprite.position.x =  e.currentTarget.tooltip.position.x;
            e.currentTarget.tooltip.sprite.position.y =  e.currentTarget.tooltip.position.y;
            //get bag
            var item = e.currentTarget.item;
            var bag = item.bag;
            if (typeof item.position == 'string'){return;}
            var xSize = item.flipped ? item.size[1] : item.size[0];
            var ySize = item.flipped ? item.size[0] : item.size[1];

            var c = Game.bagWindow.gridTextures[item.position[0]][item.position[1]];
            c.filters = [Game.bagWindow.outlineFilter3];
            c.scale.x = (xSize*32)/c.width;
            c.scale.y = (ySize*32)/c.height;
            Game.bagWindow.container.removeChild(c);
            Game.bagWindow.container.addChild(c);
        }
        var outFunc = function(e){
            if (e.currentTarget.tooltipAdded){
                Graphics.uiContainer.removeChild(e.currentTarget.tooltip.sprite);
                Game.currentToolTip = null;
                e.currentTarget.tooltipAdded = false;
            }
            //get bag
            var item = e.currentTarget.item;
            var bag = item.bag;
            if (typeof item.position == 'string'){return;}

            var xSize = item.flipped ? item.size[1] : item.size[0];
            var ySize = item.flipped ? item.size[0] : item.size[1];

            var c = Game.bagWindow.gridTextures[item.position[0]][item.position[1]];
            c.filters = [];
            c.scale.x = 1;
            c.scale.y = 1;
        }

        element.on('pointerover',overFunc);
        element.on('touchmove',overFunc);
        element.on('touchend', outFunc);
        element.on('touchendoutside', outFunc);
        element.on('pointerout', outFunc);
    };

    Tooltip.prototype.setAbilityTooltip = function(element,ability,unit){
        // element = the element containing the tooltip
        //a = the ability to work on
        var ttArray = [{text: ability.description}];
        if (typeof ability.sCost != 'undefined'){ttArray.push({text: "{Slot Cost:} " + ability.sCost})}
        if (typeof ability.eCost != 'undefined'){ttArray.push({text: "{Energy Cost:} " + ability.eCost})}
        if (typeof ability.range != 'undefined'){ttArray.push({text: "{Range:} " + ability.range})}
        if (typeof ability.radius != 'undefined'){ttArray.push({text: "{Radius:} " + ability.radius})}
        if (typeof ability.type != 'undefined'){ttArray.push({text: "{Type:} " + ability.type})}
        if (typeof ability.speed != 'undefined'){ttArray.push({text: "{Speed:} " + ability.speed})}
        unit = typeof unit == 'undefined' ? null : unit;
        this.set({
            owner: element,
            ttArray: ttArray,
            alpha: 0.5,
            unit: unit
        });
    }

    window.Tooltip = Tooltip;
})(window);
