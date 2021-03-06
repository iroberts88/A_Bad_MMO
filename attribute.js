
var utils = require('./utils.js').Utils,
    Enums = require('./enums.js').Enums,
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
    this.engine = data.owner.engine;
	this.id = data.id;
	this.value = data.value; //this stat's actual value
	this.base = data.value; //this stat's base value before buff/item mods etc.
	this.nMod = 0; //a numeric modifier added to the base value before usage
	this.pMod = 1.0; //a percentile modifier added to the base value before usage
	this.min = Utils._udCheck(data.min) ? -Infinity : data.min; //minimum value
	this.max = Utils._udCheck(data.max) ? Infinity : data.max; //maximum value

	this.setBool = false; //the attribute is forced to change to this value if true
	this.setValue = 0;
    //this is a stat that can be updated on the client (hidden or not?)
    this.updateClient = Utils.udCheck(data.clientUpdate,true,data.clientUpdate);
    //this is a stat that is updated to all players
    this.updateAll = Utils.udCheck(data.updateAll,false,data.updateAll);
	//formula for setting the attribute
	if (Utils._udCheck(data.formula)){
		this.formula = function(){return Math.round(this.base*this.pMod+this.nMod);};
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
    var pVal = this.value;
	if (this.setBool){
		//force value change
		this.value = this.setValue;
	}else{
		//normal set value
		this.value = this.formula();
		//check bounds
		this.value = Math.max(this.min,this.value);
		this.value = Math.min(this.max,this.value);
	}
    this.next(updateClient);
    if (pVal != this.value){
        var clientData = {};
        clientData[Enums.UNIT] = this.owner.id;
        clientData[Enums.STAT] = this.id;
        clientData[Enums.VALUE] = this.value;
        clientData[Enums.MOD] = Math.round(this.value)-Math.round(this.base);
        if (updateClient && this.updateClient && this.owner.owner){
            this.engine.queuePlayer(this.owner.owner,Enums.SETUNITSTAT,clientData);
        }else if (updateClient && this.updateAll){
            for (var i in this.owner.pToUpdate){
                this.engine.queuePlayer(this.owner.pToUpdate[i].owner,Enums.SETUNITSTAT,clientData);
            }
        }
    }
    return;
}

exports.Attribute = Attribute;
