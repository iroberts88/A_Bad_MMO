
(function(window) {
    NewChar = {
        slot: null,
        prompted: false,
        classInfo: null,
        raceInfo: null,
        currentClass: 'fighter',
        currentRace: 'human',
        init: function() {
            this.nameText = new PIXI.Text("Choose a name:",AcornSetup.style1);
            this.nameText.anchor.x = 0;
            this.nameText.anchor.y = 0;
            this.nameText.position.x = Graphics.width/2 - 200;
            this.nameText.position.y = 5;
            Graphics.uiContainer.addChild(this.nameText);
            this.nameBox = new TextBox();
            this.nameBox.init({
                id: 'nameBox',
                width: 400,
                height: 32,
                pos: [Graphics.width/2,this.nameText.height + 10],
                anchor: [0.5,0],
                container: Graphics.uiContainer,
                font: '20px Verdana',
                name: '',
                max: 18,
                letterOnly: true
            });
            this.raceDescText = new PIXI.Text('',AcornSetup.style2);
            this.classDescText = new PIXI.Text('',AcornSetup.style2);
            Graphics.uiContainer2.addChild(this.raceDescText);
            Graphics.uiContainer2.addChild(this.classDescText);
            this.raceDescText.position.x = 510;
            this.raceDescText.position.y = 200;
            this.classDescText.position.x = 510;
            this.classDescText.position.y = 400;
            this.drawUI();
            this.drawStats
        },
        
        drawUI: function(){
            Graphics.uiPrimitives1.clear();
            Graphics.uiContainer2.removeChildren();
            Graphics.uiContainer2.addChild(this.raceDescText);
            Graphics.uiContainer2.addChild(this.classDescText);
            var startX = 50;
            var startY = 250;
            var w = 450;
            var h = 800;
            var bX = 100;
            var bY = 32;
            Graphics.uiPrimitives1.lineStyle(2,0x484848,1);
            Graphics.uiPrimitives1.beginFill(0x484848,1);
            Graphics.uiPrimitives1.drawRoundedRect(startX,startY-50,w,h,12);
            Graphics.uiPrimitives1.endFill();
            //race buttons
            var rText = new PIXI.Text("Race:",AcornSetup.style1);
            rText.anchor.x = 0.5;
            rText.anchor.y = 0;
            rText.position.x = startX + 100;
            rText.position.y = startY-50;
            Graphics.uiContainer2.addChild(rText);
            var n = 0;
            for (var i in this.raceInfo){
                //make a button
                var button = new PIXI.Text(this.raceInfo[i].name,AcornSetup.style1);
                button.anchor.x = 0.5;
                button.position.x = startX + 100;
                button.position.y = startY + n*(bY+5)+button.height/2;
                button.interactive = true;
                button.buttonMode = true;
                button.hitArea = new PIXI.Rectangle(-bX/2,0,bX,bY);
                Graphics.uiContainer2.addChild(button);
                Graphics.uiPrimitives1.lineStyle(2,0x000000,1);
                Graphics.uiPrimitives1.beginFill(0x000000,1);
                Graphics.uiPrimitives1.drawRoundedRect(button.position.x - bX/2,button.position.y-button.height/2,bX,bY,12);
                Graphics.uiPrimitives1.endFill();
                button.raceid = i;
                this.raceInfo[i].button = button;
                button.on('pointerup', function(e){
                    var b = e.currentTarget;
                    if (NewChar.currentRace == b.raceid){
                        return;
                    }
                    Graphics.uiPrimitives2.clear();
                    NewChar.currentRace = b.raceid;
                    if (typeof NewChar.raceInfo[NewChar.currentRace].availableClasses[NewChar.currentClass] == 'undefined'){
                        for (var i in NewChar.raceInfo[NewChar.currentRace].availableClasses){
                            NewChar.currentClass = i;
                            break;
                        }
                    }
                    NewChar.reDraw();
                });
                n += 1;
            }
            //class buttons
            var cText = new PIXI.Text("Class:",AcornSetup.style1);
            cText.anchor.x = 0.5;
            cText.anchor.y = 0;
            cText.position.x = startX + 350;
            cText.position.y = startY-50;
            Graphics.uiContainer2.addChild(cText);
            var n = 0;
            for (var i in this.classInfo){
                //make a button
                var button = new PIXI.Text(this.classInfo[i].name,AcornSetup.style1);
                button.anchor.x = 0.5;
                button.position.x = startX + 350;
                button.position.y = startY + n*(bY+5)+button.height/2;
                button.interactive = true;
                button.buttonMode = true;
                button.hitArea = new PIXI.Rectangle(-bX/2,0,bX,bY);
                Graphics.uiContainer2.addChild(button);
                Graphics.uiPrimitives1.lineStyle(2,0x000000,1);
                Graphics.uiPrimitives1.beginFill(0x000000,1);
                Graphics.uiPrimitives1.drawRoundedRect(button.position.x - bX/2,button.position.y-button.height/2,bX,bY,12);
                Graphics.uiPrimitives1.endFill();
                button.classid = i;
                this.classInfo[i].button = button;
                button.on('pointerup', function(e){
                    var b = e.currentTarget;
                    if (NewChar.currentRace == b.raceid){
                        return;
                    }
                    if (typeof NewChar.raceInfo[NewChar.currentRace].availableClasses[b.classid] == 'undefined'){
                        return;
                    }
                    Graphics.uiPrimitives2.clear();
                    NewChar.currentClass = b.classid;
                    //check if class is unavailable
                    NewChar.reDraw();
                });
                n += 1;
            }

            Graphics.uiPrimitives1.lineStyle(2,0x484848,1);
            Graphics.uiPrimitives1.beginFill(0x484848,1);
            Graphics.uiPrimitives1.drawRoundedRect(startX+w+4,startY-50,w,h/2-5,12);
            Graphics.uiPrimitives1.drawRoundedRect(startX+w+4,startY-50+h/2+5,w,h/2-5,12);
            Graphics.uiPrimitives1.endFill();

            this.reDraw();
        },
        reDraw: function(){
            var bX = 100;
            var bY = 32;
            this.classDescText.text = this.classInfo[this.currentClass].name + '\n' + this.classInfo[this.currentClass].description;
            this.raceDescText.text = this.raceInfo[this.currentRace].name + '\n' + this.raceInfo[this.currentRace].description;
            for (var i in this.classInfo){
                if (typeof this.raceInfo[this.currentRace].availableClasses[this.classInfo[i].classid] == 'undefined'){
                    var cButton = this.classInfo[i].button;
                    Graphics.uiPrimitives2.lineStyle(2,0xFF0000,1);
                    Graphics.uiPrimitives2.drawRoundedRect(cButton.position.x - bX/2,cButton.position.y-cButton.height/2,bX,bY,12);
                    Graphics.uiPrimitives2.moveTo(cButton.position.x - bX/2,cButton.position.y-cButton.height/2);
                    Graphics.uiPrimitives2.lineTo(cButton.position.x + bX/2,cButton.position.y+cButton.height);
                    Graphics.uiPrimitives2.moveTo(cButton.position.x + bX/2,cButton.position.y-cButton.height/2);
                    Graphics.uiPrimitives2.lineTo(cButton.position.x - bX/2,cButton.position.y+cButton.height);
                }
            }
            var cButton = this.classInfo[this.currentClass].button;
            Graphics.uiPrimitives2.lineStyle(2,0xf4bc42,1);
            Graphics.uiPrimitives2.drawRoundedRect(cButton.position.x - bX/2,cButton.position.y-cButton.height/2,bX,bY,12);
            var rButton = this.raceInfo[this.currentRace].button;
            Graphics.uiPrimitives2.lineStyle(2,0xf4bc42,1);
            Graphics.uiPrimitives2.drawRoundedRect(rButton.position.x - bX/2,rButton.position.y-rButton.height/2,bX,bY,12);
        },
        update: function(dt){
            
        }

    }
    window.NewChar = NewChar;
})(window);
