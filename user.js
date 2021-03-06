//----------------------------------------------------------------
//user.js
//container for user info
//----------------------------------------------------------------

var AWS = require("aws-sdk"),
    ng = require('./namegenerator.js').NameGenerator,
    Enums = require('./enums.js').Enums,
    Character = require('./character.js').Character;
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

function User() {
    
    return {
        userData: null,
        owner: null,

        guest: false,

        characters: null,
        statistics: null,
       
        init: function(d){

            //user is not a guest, load profile
            if (!d.guest){
                this.characters = {};
                this.userData = {
                    username: d.username,
                    password: d.password,
                    admin: false,
                    createDate: new Date().toJSON(),
                    lastLogin: new Date().toJSON(),
                    loggedin: true
                };
                this.userData.admin = d.admin;
                this.userData.createDate = d.createDate;
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'abm_userdata',
                    Key: {
                        username: this.userData.username
                    }
                }
                var that = this;
                docClient.get(params, function(err, data) {
                    if (err) {
                        console.error("Unable to find user data. Error JSON:", JSON.stringify(err, null, 2));
                    } else {

                    }
                });
            //
            }else{
                this.guest = true;
                this.characters = {};
                var newChar = new Character();
                newChar.setOwner(this.owner);
                newChar.setEngine(this.owner.engine);
                var data = {};
                var classes = ['priest','fighter','thief','mage'];
                var cl = classes[Math.floor(Math.random()*classes.length)]
                data['slot'] = 1;
                data.scale = 2;
                var sex = Math.round(Math.random()) ? 'male' : 'female';
                data['sex'] = sex.substring(0,1);
                data['name'] = ng.generateName(sex);
                data['race'] = 'human';
                data['class'] = 'fighter';
                data['classid'] = 'fighter';
                newChar.init(data);
                newChar.setRace();
                newChar.setClass();
                newChar.currentHealth.value = newChar.maxHealth.value;
                newChar.currentHealth.set();
                newChar.currentMana.value = newChar.maxMana.value;
                newChar.currentMana.set();
                this.characters[1] = newChar;
                this.userData = {
                    username: d.username,
                    password: '',
                    admin: false,
                    createDate: new Date().toJSON(),
                    lastLogin: new Date().toJSON(),
                    loggedin: true
                };
            }
        },
        addCharacter: function(slot,character){
            this.characters[slot] = character;
            //get char info and send to player
            var data = character.getClientData();
            this.owner.engine.queuePlayer(this.owner,Enums.ADDCHARACTER, data);
        },
        lock: function(){
            this.userData.loggedin = true;
            if (!this.guest){
                try{
                    var d = this.userData;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set loggedin = :bool",
                        ExpressionAttributeValues: {
                            ":bool": true
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update loggedin->true succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable lock user");
                    console.log(e);
                }
            }
        },
        unlock: function(){
            this.userData.loggedin = false;
            if (!this.guest){
                try{
                    var d = this.userData;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set loggedin = :bool",
                        ExpressionAttributeValues: {
                            ":bool": false
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update loggedin->false succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable to unlock user");
                    console.log(e);
                }
            }
        },
        getClientData: function(){
            var data = {};
            data[Enums.CHARACTERS] = {};
            for (var i in this.characters){
                data[Enums.CHARACTERS][this.characters[i].slot] = this.characters[i].getClientData(false);
            }
            return data;
        },
        updateDB: function(){
            var ge = this.owner.gameEngine;
            if (this.userData.username != 'guest'){
                //Player is not a guest - update DB
                /*try{

                    var d = this.userData;
                    var c = [];
                    for (var i = 0; i < this.characters.length;i++){
                       c.push(this.characters[i].getDBObj());
                    }
                    var inv = [];
                    for (var i = 0; i < this.inventory.items.length;i++){
                       inv.push([this.inventory.items[i].itemID,this.inventory.items[i].amount]);
                    }
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set lastLogin = :l",
                        ExpressionAttributeValues: {
                            ":l": new Date().toJSON()
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update usrLastLogin succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                    params = {
                        TableName: 'tactics_userdata',
                        Key:{username: d.username},
                        UpdateExpression: "set characters = :c, inventory = :i",
                        ExpressionAttributeValues: {
                            ":c": c,
                            ":i": inv
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update usrData succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable to update user data");
                    console.log(e);
                }*/
            }
        },
        setOwner: function(o) {
            this.owner = o;
            var ge = this.owner.gameEngine;

        }

    }
}

exports.User = User;
