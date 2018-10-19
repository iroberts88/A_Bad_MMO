
(function(window) {
    PCS = {
    	pcs: null,
        
        init: function(data){
        	this.pcs = {};
        },

        update: function(dt){
            for (var i in this.pcs){
                this.pcs[i].update(dt);
            }
        },

        addPC: function(data){
            var char = PlayerCharacter();
            char.init(data);
            this.pcs[char.id] = char;
            Graphics.unitContainer.addChild(char.sprite);
            Graphics.unitContainer2.addChild(char.sprite2);
            Graphics.unitContainer2.addChild(char.spriteMask);
        },

        removePC: function(data){
            if (typeof this.pcs[data[Enums.ID]] == 'undefined'){
                console.log('PC deosnt exist')
                return;
            }
            Graphics.unitContainer.removeChild(this.pcs[data[Enums.ID]].sprite);
            Graphics.unitContainer2.removeChild(this.pcs[data[Enums.ID]].sprite2);
            Graphics.unitContainer2.removeChild(this.pcs[data[Enums.ID]].spriteMask);
            delete this.pcs[data[Enums.ID]]
        },

        updatePCPos: function(data){
            this.pcs[data[Enums.ID]].moveVector.x = data[Enums.MOVEVECTOR][0];
            this.pcs[data[Enums.ID]].moveVector.y = data[Enums.MOVEVECTOR][1];
            this.pcs[data[Enums.ID]].hb.pos.x = data[Enums.POSITION][0];
            this.pcs[data[Enums.ID]].hb.pos.y = data[Enums.POSITION][1];
        },

        updatePCStats: function(data){

        }
    }
    window.PCS = PCS;
})(window);
