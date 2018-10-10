
(function(window) {
    NewChar = {
        slot: null,
        prompted: false,
        classInfo: null,
        raceInfo: null,
        raceDescText: null,
        classDescText: null,

        currentClass: 'fighter',
        currentRace: 'human',

        nameValid: false,
        waitingForNameAvailability: false,
        nameAvailability: false,
        nameAvailabilitySymbol: null,
        nameAvailabilityText: null,

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
                letterOnly: true,
                onChange: function(){
                    if (NewChar.nameBox.text.length >=3 && NewChar.nameBox.text.length < 16){
                        NewChar.waitingForNameAvailability = true;
                        var data = {};
                        data[Enums.COMMAND] = Enums.CHECKNAME;
                        data[Enums.TEXT] = NewChar.nameBox.text;
                        Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
                    }else{
                        NewChar.waitingForNameAvailability = false;
                    }
                }
            });

            this.nameAvailableSymbol = new PIXI.Text('',AcornSetup.style2);
            this.nameAvailableSymbol.anchor.y = 0.5;
            this.nameAvailableSymbol.position.x = Graphics.width/2 + 225;
            this.nameAvailableSymbol.position.y = this.nameText.height + 26;
            this.nameAvailableSymbol.style.fontSize = 32;

            this.nameAvailableText = new PIXI.Text('',AcornSetup.style2);
            this.nameAvailableText.anchor.y = 0.5;
            this.nameAvailableText.position.x = Graphics.width/2 + 275;
            this.nameAvailableText.position.y = this.nameText.height + 26;

            this.enterWorldButton = Graphics.makeUiElement({
                text: 'CREATE!',
                style: AcornSetup.style3,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2),this.nameAvailableText.position.y + 100],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    var data = {};
                    data[Enums.COMMAND] = Enums.CREATECHAR;
                    data[Enums.NAME] = NewChar.nameBox.text;
                    data[Enums.RACE] = NewChar.currentRace;
                    data[Enums.CLASS] = NewChar.currentClass;
                    data[Enums.SLOT] = NewChar.slot;
                    Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,data);
                }
            });
            this.enterWorldButton.visible = false;

            this.exitButton = Graphics.makeUiElement({
                text: 'EXIT!',
                style: AcornSetup.style3,
                interactive: true,buttonMode: true,
                position: [(Graphics.width-10),10],
                anchor: [1,0],
                clickFunc: function onClick(e){
                    Acorn.changeState('mainmenu');
                }
            });

            Graphics.uiContainer.addChild(this.enterWorldButton);
            Graphics.uiContainer.addChild(this.exitButton);
            Graphics.uiContainer.addChild(this.nameAvailableSymbol);
            Graphics.uiContainer.addChild(this.nameAvailableText);

            this.raceDescText = new PIXI.Text('',AcornSetup.style2);
            this.classDescText = new PIXI.Text('',AcornSetup.style2);
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
                    if (typeof NewChar.raceInfo[NewChar.currentRace][Enums.AVAILABLECLASSES][NewChar.currentClass] == 'undefined'){
                        for (var i in NewChar.raceInfo[NewChar.currentRace][Enums.AVAILABLECLASSES]){
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
                    if (typeof NewChar.raceInfo[NewChar.currentRace][Enums.AVAILABLECLASSES][b.classid] == 'undefined'){
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
            this.classDescText.text = this.classInfo[this.currentClass][Enums.NAME] + '\n' + this.classInfo[this.currentClass][Enums.DESCRIPTION];
            this.raceDescText.text = this.raceInfo[this.currentRace][Enums.NAME] + '\n' + this.raceInfo[this.currentRace][Enums.DESCRIPTION];
            for (var i in this.classInfo){
                if (typeof this.raceInfo[this.currentRace][Enums.AVAILABLECLASSES][this.classInfo[i][Enums.CLASSID]] == 'undefined'){
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
            if (this.nameBox.text.length >=3 && this.nameBox.text.length < 16){
                this.nameValid = true;
            }else{
                this.nameAvailableSymbol.text = '';
                this.nameAvailableText.text = '';
                this.nameValid = false;
                this.enterWorldButton.visible = false;
                return;
            }
            if (this.waitingForNameAvailability){
                this.nameAvailableSymbol.text = '...';
                this.nameAvailableText.text = '';
                this.nameAvailableSymbol.style.fill = 'black';
                    this.enterWorldButton.visible = false;
            }else{
                if (this.nameAvailable){
                    this.nameAvailableSymbol.text = '🗸';
                    this.nameAvailableText.text = 'Name available!';
                    this.nameAvailableSymbol.style.fill = 'green';
                    //TODO - check stats, etc
                    this.enterWorldButton.visible = true;
                }else{
                    this.nameAvailableSymbol.text = 'X';
                    this.nameAvailableText.text = 'Name not available.';
                    this.nameAvailableSymbol.style.fill = 'red';
                    this.enterWorldButton.visible = false;
                }
            }
        }

    }
    window.NewChar = NewChar;
})(window);
