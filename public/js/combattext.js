
var P = SAT.Polygon,
    C = SAT.Circle,
    V = SAT.Vector;

(function(window) {

    CombatText = {

        container: [],

        font: {
            font: '24px Lato',
            fill: Graphics.pallette.color1,
            align: 'left',
            stroke: '#000000',
            strokeThickness: 1
        },

        time: 0.75,
        
        hitColor: 0xFFFFFF,
        getHitColor: 0xFF0000,
        missColor: 0xFFFFFF,
        healColor: 0x00FF00,

        update: function(dt){
            for (var i = 0; i < this.container.length;i++){
                var t = this.container[i];
                //t.vec.y += 0.01
                t.fs += 0.2;
                t.text.style.fontSize = t.fs;
                t.diff[1] += t.vec.y*t.speed*dt;
                t.diff[0] += t.vec.x*t.speed*dt;
                if (t.unit){
                    t.xPos = t.unit.hb.pos.x;
                    t.yPos = t.unit.hb.pos.y;
                }
                t.text.position.x = t.xPos+t.diff[0];
                t.text.position.y = t.yPos+t.diff[1];
                t.t += dt;
                if (t.t >= this.time){
                    Graphics.worldContainer.removeChild(t.text);
                    this.container.splice(i,1);
                    i -= 1;
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
                diff: [Math.random()*30-15,Math.random()*30-30-(unit.sprite.height/2)],
                vec: new V(Math.random()*0.25-.125,-(Math.random()*0.4+0.75)),
                xPos: unit.hb.pos.x,
                yPos: unit.hb.pos.y,
                t: 0,
                speed: 200,
                fs: 24
            };
            textObj.text.anchor.x = 0.5;
            textObj.text.anchor.y = 0.5;
            textObj.text.position.x = unit.hb.pos.x;
            textObj.text.position.y = unit.hb.pos.y;
            textObj.text.style.fill = color;
            Graphics.worldContainer.addChild(textObj.text);
            this.container.push(textObj);
        },

        clear: function(){
            for (var i = 0; i < this.container.length;i++){
                var t = this.container[i];
                Graphics.worldContainer.removeChild(t.text);
            }
            this.container = [];
        },

    };
    window.CombatText = CombatText;
})(window);