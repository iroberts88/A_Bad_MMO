//----------------------------------------------------------------
//charclass.js
//----------------------------------------------------------------
var Enums = require('./enums.js').Enums;

var CharClass = function(ge) {

    this.engine = ge;
    this.classid = null;
    this.name = null;
    this.description = null;
}

CharClass.prototype.init = function (data) {
    this.classid = data['classid'];
    this.name = data['name'];
    this.description = data['description'];
    this.statMods = data['statMods'];
};

CharClass.prototype.getClientObj = function (data) {
    //control what info about the character class is sent to the client
    var data = {};
    data[Enums.CLASSID] = this.classid;
    data[Enums.NAME] = this.name;
    data[Enums.DESCRIPTION] = this.description;
    data[Enums.ATTRIBUTES] = this.statMods;
    return data;
};

exports.CharClass = CharClass;