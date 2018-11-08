
(function(window) {

    var ItemSlot = function(){
        //item slot for equipment/character page
        return {
            id: null,
            init: function(data){
                this.id = data.id;
                this.name = data.name;
                this.width = data.width;
                this.height = data.height;
                this.xPos = data.xPos;
                this.yPos = data.yPos;
                this.xScale = this.width/48;
                this.yScale = this.height/48;
                this.mainCon = new PIXI.Container();
                this.gfx = new PIXI.Graphics();
                this.con = new PIXI.Container();

                this.mainCon.addChild(this.gfx);
                this.mainCon.addChild(this.con);
                this.itemInfo = null;

                this.parent = data.parent;


                this.gfx.lineStyle(1,0xFFFFFF,1);
                this.gfx.beginFill(0x000000,0.4);
                this.gfx.drawRect(0,0,this.width,this.height);
                this.gfx.endFill();

                var nameText = new PIXI.Text(this.name,AcornSetup.style1);
                nameText.style.fill = 0xFFFFFF;
                this.con.addChild(nameText);
                nameText.anchor.x = 0.5;
                nameText.anchor.y = 0.5;
                nameText.position.x = this.width/2;
                nameText.position.y = this.height/2;
                Graphics.fitText(nameText,this.width,this.height);

                this.mainCon.position.x = this.xPos-this.width/2;
                this.mainCon.position.y = this.yPos-this.height/2;

                this.parent.addChild(this.mainCon);

            },

            update: function(dt){
                
            },

            resize: function(w,h){
                this.width = Math.min(this.maxWidth,Math.max(this.minWidth,w));
                this.height = Math.min(this.maxHeight,Math.max(this.minHeight,h));
            },

        }
    };
    window.ItemSlot = ItemSlot;
})(window);