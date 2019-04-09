var fs = require('fs');

var enums = [
        'AC',
        'ACQUIRETARGET',
        'ADDCHARACTER',
        'ADDITEM',
        'ADDPC',
        'ADDNPC',
        'AGILITY',
        'ALL',
        'AMMO',
        'ARCANERES',
        'ARMS',
        'ATTRIBUTES',
        'AVAILABLECLASSES',

        'BACK',
        'BAG',
        'BAG1',
        'BAG2',
        'BAG3',
        'BAG4',
        'BAGSIZE',
        'BLUDGEON',
        'BOOL',

        'CARRYWEIGHT',
        'CLEARTARGET',
        'CHARACTERS',
        'CHARISMA',
        'CHECKNAME',
        'CHEST',
        'CLIENTCOMMAND',
        'CLASSES',
        'CLASS',
        'CLASSID',
        'COMBATBEHAVIOUR',
        'COMMAND',
        'CONNINFO',
        'COPPER',
        'CREATECHAR',
        'CREATECHARERROR',
        'CURRENTENERGY',
        'CURRENTEXP',
        'CURRENTHEALTH',
        'CURRENTMANA',
        'CURRENTWEIGHT',

        'DEALDAMAGE',
        'DEALTDAMAGE',
        'DESCRIPTION',
        'DEXTERITY',
        'DISEASERES',
        'DWARF',

        'EAR1',
        'EAR2',
        'EARTHRES',
        'ELF',
        'ENTERGAME',
        'EQUIPITEM',

        'FACE',
        'FEET',
        'FIGHTER',
        'FINGER1',
        'FINGER2',
        'FIRERES',
        'FLAVORTEXT',
        'FLIPPED',
        'FROSTRES',

        'GETINVENTORY',
        'GNOME',
        'GOLD',
        'GRID',

        'HANDS',
        'HEAD',
        'HEALINGPOWER',
        'HEALTHPERCENT',
        'HOLYRES',
        'HUMAN',

        'ID',
        'IDLEBEHAVIOUR',
        'INTELLIGENCE',
        'ITEM',
        'ITEMID',
        'ITEMS',

        'JUMPSPEED',
        'JUMPTIME',

        'LEGS',
        'LEVEL',
        'LOGINATTEMPT',
        'LOGOUT',
        'LOGGEDIN',
        'LORE',
        'LUCK',

        'MAGE',
        'MAGIC',
        'MAIN',
        'MAPDATA',
        'MAPNAME',
        'MAXENERGY',
        'MAXHEALTH',
        'MAXMANA',
        'MESSAGE',
        'MESSAGETYPE',
        'MELEEPOWER',
        'MISSED',
        'MOD',
        'MOVE',
        'MOVEITEM',
        'MOVEVECTOR',

        'NAME',
        'NECK',
        'NEWMAP',
        'NPCS',

        'ONEQUIPTEXT',
        'OPEN',
        'OVERLAYRESOURCE',
        'OVERLAYTYPE',
        'OWNER',

        'PERCEPTION',
        'PIERCE',
        'PLATINUM',
        'PLAYERS',
        'PLAYERUPDATE',
        'POISONRES',
        'POSITION',
        'POSUPDATE',

        'QUANTITY',

        'RACE',
        'RACEID',
        'RACES',
        'RANGE',
        'RANGED',
        'RANGEDPOWER',
        'REMOVEITEM',
        'REMOVEPC',
        'REMOVENPC',
        'RESOURCE',

        'SAY',
        'SCALE',
        'SECONDARY',
        'SECTORARRAY',
        'SETITEMQUANTITY',
        'SETLOGINERRORTEXT',
        'SETMELEEATTACK',
        'SETRANGEDATTACK',
        'SETUNITSTAT',
        'SETTARGET',
        'SEX',
        'SHADOWRES',
        'SHOCKRES',
        'SHOULDERS',
        'SHOUT',
        'SILVER',
        'SIZE',
        'SLASH',
        'SLOT',
        'SLOTS',
        'SPAWNID',
        'SPELLPOWER',
        'SPEED',
        'SPIRIT',
        'STACK',
        'STAT',
        'STATS',
        'STAMINA',
        'STICK',
        'STRENGTH',

        'TARGET',
        'TEXT',
        'THIEF',
        'TILES',
        'TRIGGERS',
        'TRINKET1',
        'TRINKET2',
        'TWOHANDED',

        'UNIT',
        'UNEQUIPITEM',
        'VALUE',

        'WAIST',
        'WEIGHT',
        'WHISPER',
        'WINDRES',
        'WISDOM',
        'WRIST1',
        'WRIST2',

        'X',

        'Y',

        'ZONE'
]

function init(){

    fs.truncate('enums.txt', 0, function(){console.log('enums.txt cleared')})
    var writeStream = fs.createWriteStream('enums.txt', {AutoClose: true});
    for (var i = 0; i < enums.length;i++){
    	var text = '    ' + enums[i] + ': ' + i + ''
    	if (i < enums.length-1){
    		text += ',';
    	}
    	text += '\n';
    	writeStream.write(text);
    }
}


init();