var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var players_model = require('../models/players.js');
var http = require("http"),
    mongojs = require("mongojs"),
        async = require('async'),

    db = mongojs.connect(config.mongo_uri);
var images_list = require('../lists/images2.js');

var download = function(uri, filename, player, items, player_type, iteration){
  request.head(uri, function(err, res, body){
    var avatar_url = {};
    var content_type = res.headers['content-type'];
    //make sure the image actually exists
    if (content_type == 'image/jpeg'){
        //This is really dirty. Mongo doesnt allow iterative variables in the update so we trick it by casting the object before asking mongo
        avatar_url[player_type+"."+ iteration +".avatar_url"] = '../images/headshots/nba/'+player.full_name.replace(/\s+/g, '-').toLowerCase()+'.jpg';
    	request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
        });
        
    }
    else{
        var team_id = items.team_id;
        avatar_url[player_type+"."+ iteration +".avatar_url"] = null;
    }
    db.collection('players').findAndModify({
            query: {team_id: team_id},
            update: {$set: avatar_url},
            new: true
        }, function(err, doc, lastErrorObject) {
            if (err) console.log(error);
            if (lastErrorObject) console.log(lastErrorObject);
        });
    
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
            download(url, '../images/headshots/nba/'+full_name+'.jpg', items[i].bench[b], items[i], 'bench', b);

    	}
    	for (var c=0; c < items[i].starters.length; c++){
    		var full_name = items[i].starters[c].full_name.replace(/\s+/g, '-').toLowerCase();
    		var url = 'http://www.gannett-cdn.com/media/SMG/sports_headshots/nba/player/2014/'+usat_id+'/120x120/'+full_name+'.jpg';
	  		download(url, '../images/headshots/nba/'+full_name+'.jpg', items[i].starters[c], items[i], 'starters', c);
    	}

    }
  });

