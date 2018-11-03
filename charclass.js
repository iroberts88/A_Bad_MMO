//----------------------------------------------------------------
//charclass.js
//----------------------------------------------------------------

var CharClass = function(ge) {

    this.engine = ge;
    this.classid = null;
    this.name = null;
    this.description = null;
}

CharClass.prototype.init = function (data) {
    this.classid = data.classid;
    this.name = data.name;
    this.description = data.description;
};

CharClass.prototype.getClientObj = function (data) {
    //control what info about the character class is sent to the client
    var data = {};
    data[this.engine.enums.CLASSID] = this.classid;
    data[this.engine.enums.NAME] = this.name;
    data[this.engine.enums.DESCRIPTION] = this.description;
    return data;
};

exports.CharClass = CharClass;