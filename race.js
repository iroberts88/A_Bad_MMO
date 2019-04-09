//----------------------------------------------------------------
//race.js
//----------------------------------------------------------------

var Enums = require('./enums.js').Enums;

var Race = function(ge) {

    this.engine = ge;

    this.raceid = null;
    this.name = null;
    this.attributes = null;
    this.availableClasses = null;
    this.description = null;
}

Race.prototype.init = function (data) {
    this.raceid = data['raceid'];
    this.name = data['name'];
    this.description = data['description'];
    this.attributes = data['attributes'];
    this.availableClasses = data['availableClasses'];
};

Race.prototype.getClientObj = function (data) {
    //control what info about the character race is sent to the client
    var data = {}
    data[Enums.RACEID] = this.raceid;
    data[Enums.NAME] = this.name;
    data[Enums.ATTRIBUTES] = this.attributes;
    data[Enums.AVAILABLECLASSES] = this.availableClasses;
    data[Enums.DESCRIPTION] = this.description;
    return data;
};

exports.Race = Race;