var fs = require('fs'),
    AWS = require("aws-sdk");

var name1 = '{Mortideus}',
    name2 = '--Faulken--',
    p1DMG = 48,
    p2DMG = 10,
    p1DELAY = 4.8,
    p2DELAY = 1.0,
    p1AC = 2250,
    p2AC = 1200,
    p1ATTACK = 2250,
    p2ATTACK = 3000,
    p1HP = 5000,
    p2HP = 5000,
    p1Ticker = 0,
    p2Ticker = 0;

var now = 0,
    dt = 0,
    lastTime = Date.now();

function init() {
    interval = setInterval(tick, 20); 
}

function tick(){
    now = Date.now();
    dt = (now - lastTime) / 1000.0;

    p1Ticker += dt; 
    p2Ticker += dt;

    if (p1Ticker >= p1DELAY){
        //attack
        var acrandom = Math.random();
        var attkrandom = Math.random();
        if (p2AC*acrandom < p1ATTACK*attkrandom){
            var dmgmod = (p1ATTACK*attkrandom - p2AC*acrandom) / 100;
            var dmg = Math.ceil(Math.random()*p1DMG + dmgmod*p1DMG);
            console.log(name1 + ' HIT ' + name2 + ' for   ' + dmg + '   damage! (' + p2HP + '->' + Math.max(0,p2HP-dmg) + ')\n');
            p2HP -= dmg;
            if (p2HP <= 0){
                console.log(name2 + ' has died.\n');
                clearInterval(interval);
                return;
            }
        }else{
            console.log(name1 + ' missed ' + name2 + '\n');
        }
        p1Ticker -= p1DELAY;
    }

    if (p2Ticker >= p2DELAY){
        //attack
        var acrandom = Math.random();
        var attkrandom = Math.random();
        if (p1AC*acrandom < p2ATTACK*attkrandom){
            var dmgmod = (p2ATTACK*attkrandom - p1AC*acrandom) / 100;
            var dmg = Math.ceil(Math.random()*p2DMG + dmgmod*p2DMG);
            console.log(name2 + ' HIT ' + name1 + ' for   ' + dmg + '   damage! (' + p1HP + '->' + Math.max(0,p1HP-dmg) + ')\n');
            p1HP -= dmg;
            if (p1HP <= 0){
                console.log(name1 + ' has died.\n');
                clearInterval(interval);
                return;
            }
        }else{
            console.log(name2 + ' missed ' + name1 + '\n');
        }
        p2Ticker -= p2DELAY;
    } 

    lastTime = now;
}

init();



