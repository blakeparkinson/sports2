var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var players_model = require('../models/players.js');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var images_list = require('../lists/images2.js');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    var content_type = res.headers['content-type'];
    //make sure the image actually exists
    if (content_type == 'image/jpeg'){
    	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    }
  });
};

db.collection('players').find().toArray(function (err, items){
    for (var i=0; i < items.length; i++){
    	for (var y=0; y < images_list.images.length;y++){
    		if (items[i].league == images_list.images[y].league){
    			for (var k=0;k<images_list.images[y].teams.length; k++){
    				if (items[i].team_name == images_list.images[y].teams[k].team_name){
    					var usat_id = images_list.images[y].teams[k].usat_id;
    					break;
    				}
    			}
    		}
    	}
    	for (var b=0; b < items[i].bench.length; b++){
    		var full_name = items[i].bench[b].full_name.replace(/\s+/g, '-').toLowerCase();
    		var url = 'http://www.gannett-cdn.com/media/SMG/sports_headshots/nba/player/2014/'+usat_id+'/120x120/'+full_name+'.jpg';
	  		console.log(url);
	  		download(url, '../images/headshots/nba/'+full_name+'.jpg', function(){
					console.log('done');
				});
    	}
    	for (var b=0; b < items[i].starters.length; b++){
    		var full_name = items[i].starters[b].full_name.replace(/\s+/g, '-').toLowerCase();
    		var url = 'http://www.gannett-cdn.com/media/SMG/sports_headshots/nba/player/2014/'+usat_id+'/120x120/'+full_name+'.jpg';
	  		download(url, '../images/headshots/nba/'+full_name+'.jpg', function(){
					console.log('done');
				});
    	}

    	//TODO go through and insert the picture back to the player, with empty image for ppl we dont find

    }
  });

