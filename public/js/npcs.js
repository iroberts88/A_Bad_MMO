
(function(window) {
    NPCS = {
    	npcs: null,
        
        init: function(data){
        	this.npcs = {};
        },

        update: function(dt){
            for (var i in this.pcs){
                this.npcs[i].update(dt);
            }
        },

        addNPC: function(data){
            var char = Unit();
            char._init(data);
            this.npcs[char.id] = char;
            Graphics.unitContainer.addChild(char.sprite);
            Graphics.unitContainer2.addChild(char.sprite2);
            Graphics.unitContainer2.addChild(char.spriteMask);
            Graphics.unitContainer2.addChild(char.nameTag);
        },

        removeNPC: function(data){
            if (typeof this.npcs[data[Enums.ID]] == 'undefined'){
                console.log('PC deosnt exist')
                return;
            }
            Graphics.unitContainer.removeChild(this.pcs[data[Enums.ID]].sprite);
            Graphics.unitContainer2.removeChild(this.pcs[data[Enums.ID]].sprite2);
            Graphics.unitContainer2.removeChild(this.pcs[data[Enums.ID]].spriteMask);
            Graphics.unitContainer2.removeChild(this.pcs[data[Enums.ID]].nameTag);
            delete this.pcs[data[Enums.ID]]
        },

        getNPC: function(id){
            if (typeof this.npcs[id] == 'undefined'){
                console.log('PC doesnt exist')
                return false;
            }
            return this.pcs[id];
        },
        updateNPCPos: function(data){
            this.npcs[data[Enums.ID]].moveVector.x = data[Enums.MOVEVECTOR][0];
            this.npcs[data[Enums.ID]].moveVector.y = data[Enums.MOVEVECTOR][1];
            this.npcs[data[Enums.ID]].hb.pos.x = data[Enums.POSITION][0];
            this.npcs[data[Enums.ID]].hb.pos.y = data[Enums.POSITION][1];
        },

        updateNPCStats: function(data){

        }
    }
    window.NPCS = NPCS;
})(window);
