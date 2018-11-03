//----------------------------------------------------------------
//race.js
//----------------------------------------------------------------

var Race = function(ge) {

    this.engine = ge;

    this.raceid = null;
    this.name = null;
    this.attributes = null;
    this.availableClasses = null;
    this.description = null;
}

Race.prototype.init = function (data) {
    this.raceid = data.raceid;
    this.name = data.name;
    this.description = data.description;
    this.attributes = data.attributes;
    this.availableClasses = data.availableClasses;
};

Race.prototype.getClientObj = function (data) {
    //control what info about the character race is sent to the client
    var data = {}
    data[this.engine.enums.RACEID] = this.raceid;
    data[this.engine.enums.NAME] = this.name;
    data[this.engine.enums.ATTRIBUTES] = this.attributes;
    data[this.engine.enums.AVAILABLECLASSES] = this.availableClasses;
    data[this.engine.enums.DESCRIPTION] = this.description;
    return data;
};

exports.Race = Race;