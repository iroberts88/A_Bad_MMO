//----------------------------------------------------------------
//charclass.js
//----------------------------------------------------------------

var CharClass = function(ge) {

    this.engine = ge;

    this.classid = null;
    this.name = null;
}

CharClass.prototype.init = function (data) {
    this.classid = data[this.engine.enums.CLASSID];
    this.name = data[this.engine.enums.NAME];

};

CharClass.prototype.getClientObj = function (data) {
    //control what info about the character class is sent to the client
    var data = {}
    data[this.engine.enums.CLASSID] = this.classid;
    data[this.engine.enums.NAME] = this.name;
    return data;
};

exports.CharClass = CharClass;