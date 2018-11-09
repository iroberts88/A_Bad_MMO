var fs = require('fs'),
	Jimp = require('jimp');

var interval,
	columns = 16,
	rows = 32,
	s = 16,
	x = 0,
	y = 0,
	next = true,
	end = false;

function init(){
	interval = setInterval(tick,20);
}

function tick(){
	if (next && !end){
		x += 1;
		if (x == columns){
			x = 0;
			y += 1;
		}
		if (y == rows){
			end = true;
		}
		cutImage();
		next = false;
	}
}
function cutImage(){
	Jimp.read('town.png', function (err,image){
		if (err){throw err}
		console.log('cutting ' + x + 'x' + y);
		image.crop(x*s,y*s,s,s);
		var file = x + 'x' + y + '_t.' + image.getExtension();
		image.write(file);
		next = true;
		if (end){
			clearInterval(interval);
			console.log('done');
		}
	});
}


init();