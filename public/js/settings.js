(function(window) {

//TODO put this into Acorn???

    Settings = {
        scaleToFit: null,
        mute: null,
        masterVolume: null,
        musicVolume: null,
        sfxVolume: null,
        uilocked: null,
        autoFullScreen: null,
        stats: null,
        statsOn: null,
        currentRotation: null,
        charScrollSpeed: null,

        nSpeed: null,

        init: function() {
        	//Working
            this.scaleToFit = true; //scale to fit screen size
            this.mute = false; 
            this.masterVolume = 1.0;
            this.musicVolume = 1.0;
            this.sfxVolume = 1.0;

            this.uilocked = true;

            this.autoFullScreen = false;
            this.currentMap = null;
            this.stats = new Stats();
            this.stats.setMode(0);
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';
            this.statsOn = false;
            this.currentRotation = 0;
        },
        toggleUILock: function(){
            if (this.uilocked){
                this.uilocked = false;

            }else{
                this.uilocked = true;
            }
            Game.setUILock(this.uilocked);
        },
        toggleStats: function(){
            if (this.statsOn){
                var mode = this.stats.getMode();
                if (mode == 3){
                    this.stats.setMode(0);
                    this.stats.modeSwitch(0);
                    this.statsOn = false;
                    document.body.removeChild( this.stats.domElement );
                }else{
                    this.stats.modeSwitch( ++ mode % 4 );
                    this.stats.setMode(mode);
                }
            }else{
                this.statsOn = true;
                document.body.appendChild( this.stats.domElement );
            }
        },
        toggleAutoFullScreen: function(){
            if (this.autoFullScreen){
                this.autoFullScreen = false;
                Graphics.renderer.view.removeEventListener('click',Settings.requestFullScreen);
                Graphics.renderer.view.removeEventListener('touchend',Settings.requestFullScreen, {passive: false});
                Settings.exitFullScreen();
            }else{
                this.autoFullScreen = true;
                Graphics.renderer.view.addEventListener('click',Settings.requestFullScreen);
                Graphics.renderer.view.addEventListener('touchend',Settings.requestFullScreen, {passive: false});
            }
        },
        requestFullScreen: function(e){
            e.preventDefault();
            document.body.style.overflow = 'visible';
            if (!document.fullscreenElement){
                var c = document.body;
                if (c.webkitRequestFullScreen){
                    c.webkitRequestFullScreen();
                }else if (c.mozRequestFullScreen){
                    c.mozRequestFullScreen();
                }else if (c.requestFullscreen){
                    c.requestFullscreen();
                }else if (c.msRequestFullscreen){
                    c.msRequestFullscreen();
                }
            }
            if (Acorn.currentState == 'initialScreen'){
                Acorn.changeState('mainMenu');
            }
        },
        exitFullScreen: function(){
            if (document.webkitExitFullscreen){
                document.webkitExitFullscreen();
            }else if (document.mozCancelFullScreen){
                document.mozCancelFullScreen();
            }else if (document.exitFullscreen){
                document.exitFullscreen();
            }else if (document.msExitFullscreen){
                document.msExitFullscreen()
            }
            document.body.style.overflow = 'hidden';
            Graphics.resize();
        },
        toggleScaleToFit: function(){
            if (this.scaleToFit){
                this.scaleToFit = false;
            }else{
                this.scaleToFit = true;
            }
            Graphics.resize();
        },
        toggleMute: function(){
            if (this.mute){
                this.mute = false;
                this.setMasterVolume(this.masterVolume);
            }else{
                this.mute = true;
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    Acorn.Sound._sounds[i].volume = 0;
                }
            }
        },
        setSFXVolume: function(v){
            Settings.sfxVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    var snd = Acorn.Sound._sounds[i];
                    if (snd.type == 'sfx'){
                        snd.volume = snd.volumeBase*Settings.masterVolume*Settings.musicVolume;
                    }
                }
            }
        },
        setMusicVolume: function(v){
            Settings.musicVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    var snd = Acorn.Sound._sounds[i];
                    if (snd.type == 'music'){
                        snd.volume = snd.volumeBase*Settings.masterVolume*Settings.musicVolume;
                    }
                }
            }
        },
        setMasterVolume: function(v){
            Settings.masterVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                Settings.setMusicVolume(Settings.musicVolume);
                Settings.setSFXVolume(Settings.sfxVolume);
            }
        }
    };
    
    Settings.init();

    window.Settings = Settings;
})(window);