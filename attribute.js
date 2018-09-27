
var utils = require('./utils.js').Utils,
    Utils = new utils();

//attribute.js
//an alterable attribute  

var Attribute = function(){
    this.owner = null;
    this.id = null;
    this.value = null; 
    this.base = null; 
    this.nMod = null; 
    this.pMod = null;
    this.min = null; 
    this.max = null;

    this.formula = null;
    this.next = null;
}
        
Attribute.prototype.init = function(data){
	this.owner = data.owner; //the unit that owns this stat
	this.id = data.id;
	this.value = data.value; //this stat's actual value
	this.base = data.value; //this stat's base value before buff/item mods etc.
	this.nMod = 0; //a numeric modifier added to the base value before usage
	this.pMod = 1.0; //a percentile modifier added to the base value before usage
	this.min = data.min; //minimum value
	this.max = data.max; //maximum value

	this.setBool = false; //the attribute is forced to change to this value if true
	this.setValue = 0;
    //this is a stat that can be updated on the client (hidden or not?)
    this.updateClient = Utils.udCheck(data.clientUpdate,true,data.clientUpdate);
	//formula for setting the attribute
	if (Utils._udCheck(data.formula)){
		this.formula = function(){return Math.round((this.base+this.nMod)*this.pMod);};
    }else{
    	this.formula = data.formula;
    }
    //function to be executed after the attribute is set
    if (Utils._udCheck(data.next)){
    	this.next = function(){};
    }else{
    	this.next = data.next;
    }
}
Attribute.prototype.set = function(updateClient){
	if (this.setBool){
		//force value change
		this.value = this.setValue;
	}else{
		//normal set value
		this.value = this.formula();
		//check bounds
		if (!Utils._udCheck(this.min)){
    		if (this.value < this.min){
    			this.value = this.min;
    		}
    	}
        if (!Utils._udCheck(this.max)){
    		if (this.value > this.max){
    			this.value = this.max;
    		}
    	}
	}
    this.next()
    if (updateClient && this.updateClient && this.owner.owner){
        this.owner.owner.engine.queuePlayer(this.owner.owner,'setUnitStat',{
            'unit': this.owner.id,
            'stat': this.id,
            'amt': this.value
        });
    }
    return;
}

exports.Attribute = Attribute;
