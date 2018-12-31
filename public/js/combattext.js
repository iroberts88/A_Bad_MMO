
var P = SAT.Polygon,
    C = SAT.Circle,
    V = SAT.Vector;

(function(window) {

    CombatText = {

        container: {},

        font: {
            font: '28px Lato',
            fill: Graphics.pallette.color1,
            align: 'left',
            stroke: '#000000',
            strokeThickness: 1
        },

        time: 1.5,
        
        hitColor: 0xFFFFFF,
        getHitColor: 0xFF0000,
        missColor: 0xFFFFFF,
        healColor: 0x00FF00,

        update: function(dt){
            for (var i in this.container){
                this.updateText(this.container[i],dt);
                if (this.container[i].length == 0){
                    delete this.container[i]
                }
            }
        },

        updateText: function(arr,dt){
            for (var i = arr.length-1; i >= 0;i--){
                var t = arr[i];
                t.xPos = t.unit.hb.pos.x;
                t.yPos = t.unit.hb.pos.y;
                if (typeof arr[i+1] != 'undefined'){
                    while((arr[i+1].yPos+arr[i+1].diff[1])-(t.yPos+t.diff[1]) < t.text.height){
                        t.yPos -= 1;
                    }
                }
                t.diff[1] += t.vec.y*t.speed*dt;
                t.diff[0] += t.vec.x*t.speed*dt;
                //check collision?
                t.text.position.x = t.xPos+t.diff[0];
                t.text.position.y = t.yPos+t.diff[1];
                t.t += dt;
                if (t.t >= this.time){
                    Graphics.world.removeChild(t.text);
                    arr.splice(i,1);
                    i -= 1;
                    if (arr.length == 0){
                        return;
                    }
                }
            }
        },

        addText: function(data){
            var text = typeof data.text == 'undefined' ? '????' : data.text;
            var color = typeof data.color == 'undefined' ? this.hitColor : data.color;
            var unit = typeof data.unit == 'undefined' ? Player.currentCharacter : data.unit;
            var textObj = {
                text: new PIXI.Text(text,this.font),
                unit: unit,
                diff: [Math.random()*30-15,0],
                vec: new V(0,-1),
                xPos: unit.hb.pos.x,
                yPos: unit.hb.pos.y,
                t: 0,
                speed: 100,
                fs: 24
            };
            textObj.text.anchor.x = 0.5;
            textObj.text.anchor.y = 0.5;
            textObj.text.position.x = unit.hb.pos.x;
            textObj.text.position.y = unit.hb.pos.y;
            textObj.text.style.fill = color;
            Graphics.world.addChild(textObj.text);
            if (typeof this.container[unit.id] == 'undefined'){
                this.container[unit.id] = [];
            }
            this.container[unit.id].push(textObj);
        },

        clear: function(){
            for (var i = 0; i < this.container.length;i++){
                var t = this.container[i];
                Graphics.world.removeChild(t.text);
            }
            this.container = [];
        },

    };
    window.CombatText = CombatText;
})(window);