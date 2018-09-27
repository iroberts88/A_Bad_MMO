
(function(window) {
    NewChar = {
        slot: null,
        prompted: false,
        classInfo: null,
        raceInfo: null,
        init: function() {
            this.nameBox = new TextBox();
            this.nameBox.init({
                id: 'nameBox',
                width: 400,
                height: 32,
                container: Graphics.uiContainer,
                font: '20px Verdana',
                name: 'Name'
            })
            Graphics.uiContainer.addChild(this.nameBox.c);
        },
        
        update: function(dt){
            this.nameBox.update(dt);
        }

    }
    window.NewChar = NewChar;
})(window);
