var app = require('http').createServer(webResponse),
    AWS = require("aws-sdk"),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    GameEngine = require('./gameengine.js').GameEngine,
    mongo = require('mongodb'),
    RequireCheck = require('./requirecheck.js').RequireCheck;


const crypto = require('crypto');
    
var rc = null,
    ge = null;

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});


function init() {

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    rc = new RequireCheck();
    ge = new GameEngine();

    rc.onReady(onReady);

    // ----------------------------------------------------------
    // Start Database Connection
    // ----------------------------------------------------------

    rc.ready();
    rc.require('dbMaps','dbClasses','dbRaces','dbUsers','dbEnemies','dbBuffs','dbSpawns','dbItems','dbFactions');

    fs.readFile( './db/abm_races.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_races", err );
            process.exit( 1 );
        } 
        ge.loadRaces(JSON.parse(data));
        rc.ready('dbRaces');
    });
    fs.readFile( './db/abm_classes.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_classes", err );
            process.exit( 1 );
        } 
        ge.loadClasses(JSON.parse(data));
        rc.ready('dbClasses');
    });
    fs.readFile( './db/abm_items.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_items", err );
            process.exit( 1 );
        } 
        ge.loadItems(JSON.parse(data));
        rc.ready('dbItems');
    });
    fs.readFile( './db/abm_buffs.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_buffs", err );
            process.exit( 1 );
        } 
        //ge.loadBuffs(JSON.parse(data));
        rc.ready('dbBuffs');
    });
    fs.readFile( './db/abm_factions.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_factions", err );
            process.exit( 1 );
        } 
        ge.loadFactions(JSON.parse(data));
        rc.ready('dbFactions');
    });
    //load enemies
    fs.readFile( './db/abm_enemies.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_enemies", err );
            process.exit( 1 );
        } 
        ge.loadEnemies(JSON.parse(data));
        rc.ready('dbEnemies');

        fs.readFile( './public/img/sprites.json', function( err, data ) {
            if( err ) {
                console.error( "Could not list the directory. - enemy dimensions", err );
                process.exit( 1 );
            }
            ge.getEnemyDimensions(JSON.parse(data));
            rc.ready('dbEnemies');
        });
    });
    //Load spawn points and maps
    fs.readFile( './db/abm_spawns.json', function( err, data ) {
        if( err ) {
            console.error( "Could not list the directory. - abm_spawns", err );
            process.exit( 1 );
        } 
        ge.loadSpawns(JSON.parse(data));
        rc.ready('dbSpawns');

        fs.readdir( './mapgen_tool/maps', function( err, files ) {
            if( err ) {
                console.error( "Could not list the directory.", err );
                process.exit( 1 );
            } 
            ge.mapCount = files.length;
            ge.loadMaps(files);
            rc.ready('dbMaps');
        });
    });


/*
    // ---- Load Classes/races/enemies from MONGODB ----
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://127.0.0.1:27017/lithiumAve";

    MongoClient.connect(url, { useNewUrlParser:true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("lithiumAve");
      dbo.collection("abm_races").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadRaces(result);
        rc.ready('dbRaces');
        db.close();
      });

      dbo.collection("abm_classes").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadClasses(result);
        rc.ready('dbClasses');
        db.close();
      });

      dbo.collection("abm_items").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadItems(result);
        rc.ready('dbItems');
        db.close();
      });

      dbo.collection("abm_enemies").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadEnemies(result);
        db.close();
        // ---- Load Enemy sprite json
            fs.readFile( './public/img/sprites.json', function( err, data ) {
                if( err ) {
                    console.error( "Could not list the directory.", err );
                    process.exit( 1 );
                }
                ge.getEnemyDimensions(JSON.parse(data));
                rc.ready('dbEnemies');
            });
      });

      dbo.collection("abm_spawns").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadSpawns(result);
        rc.ready('dbSpawns');
        db.close();
        
            // ---- Load Maps Directly from file ----
            fs.readdir( './mapgen_tool/maps', function( err, files ) {
                if( err ) {
                    console.error( "Could not list the directory.", err );
                    process.exit( 1 );
                } 
                ge.mapCount = files.length;
                ge.loadMaps(files);
                rc.ready('dbMaps');
            });

      });
      dbo.collection("abm_buffs").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadBuffs(result);
        rc.ready('dbBuffs');
        db.close();
      });
      dbo.collection("abm_factions").find().toArray(function(err, result) {
        if (err) throw err;
        ge.loadFactions(result);
        rc.ready('dbFactions');
        db.close();
      });
    });
*/

    // ---- Load Userbase from Dynamodb----
    docClient.scan({TableName: 'users'}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Checking user logged-in status...");
            for (var i = 0; i < data.Items.length;i++){
                if (data.Items[i].loggedin){
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: data.Items[i].username},
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
                }
            }
            rc.ready('dbUsers');
        }
    });

}
init();



// ----------------------------------------------------------
// Start Web Server
// ----------------------------------------------------------
var port = process.env.PORT || 3001;
app.listen(port);

function webResponse(req, res) {
    var filename = req.url;

    // Check for default
    if (filename == '/') {
        filename = '/index.html';
    }

    //console.log('HTTP Request: ' + filename);

    fs.readFile(__dirname + '/public' + filename, function(err, data) {
        if (err) {
            console.log('Couldn\'t find file: ' + req.url);
            res.writeHead(500);
            res.end('Couldn\'t find file: ' + req.url)
        }

        res.writeHead(200);
        res.end(data);
    });
}

function onReady() {
    console.log('All require items loaded. Starting Game Engine!');
    ge.init();
}


// TO DO: Need to keep track of sockets with ids
// ----------------------------------------------------------
// Start Socket Listener
// ----------------------------------------------------------
io.sockets.on('connection', ge.newConnection);

console.log('Listening');


