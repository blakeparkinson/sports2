var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require("http"),
		async = require('async'),
    mongojs = require("mongojs"),

    db = mongojs.connect(config.mongo_uri);


var request = require('request');
var difference = require('array-difference');

var players_model = require('../models/players.js');

//process.argv grabs the command line arguments
var league = process.argv[2];
var options = {};
options.only_insert = true;
var rosters = [];


    db.collection('teams').find({'league': league}).toArray(function (err, teams) {
    	db.collection('players').find().toArray(function (err, players){
    		var common_team_ids = [];
    		var all_team_ids = [];
    		for (var i=0; i < teams.length; i++){
    			all_team_ids.push(teams[i].team_id);
    			for (var j=0; j < players.length; j++){
    				if (teams[i].team_id == players[j].team_id){
    					common_team_ids.push(teams[i].team_id);
    				}
    			}
    		}
    		var uncommon_team_ids = difference(common_team_ids, all_team_ids);
						

				async.eachSeries(uncommon_team_ids, function		(id, callback) {
					request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+id+'/statistics.json?api_key=' + config.nba_key, function (error, response, body) {
						if (!error && response.statusCode == 200) {
	        		json_response = JSON.parse(body);
							request('https://api.sportsdatallc.org/nba-t3/teams/'+id+'/profile.json?api_key=' +config.nba_key, function (error, response, roster) {
								 	if (!error && response.statusCode == 200) {
	                 var team_roster = JSON.parse(roster);
	                 var players_roster = team_roster.players;
	                 for (var i=0; i<json_response.players.length;i++){
	                  for (var j=0; j<players_roster.length; j++){
	                    //compare by player id
	                    if (json_response.players[i].id == players_roster[j].id){
	                      json_response.players[i].status = players_roster[j].status;
	                      //we found a match, break out of the 2nd loop iteration
	                      continue;
	                    }
	                  }
	                }
					        players_sorted = players_model.sortNBA(json_response);
					        players = players_model.formatPlayers(players_sorted, id);
									rosters.push(players);
									callback();
								}

							else{
				        console.log('error:' + error + ' ,response: '+ response.statusCode);
				        if (rosters.length){
				        	console.log('failed on active player call.')
				        	players_model.mongoBulkInsertPlayers(rosters);
				        }
				      }
				    });
					}
		      else{
		        console.log('error:' + error + ' ,response: '+ response.statusCode);
		        console.log('failed before we did anything');
		        if (rosters.length){
			        console.log('failed on roster fetching call');
		        	players_model.mongoBulkInsertPlayers(rosters);
		        }
	      	}
		    });
			},
			function done() {
				//somehow we didn't get rate limited!!!!
				players_model.mongoBulkInsertPlayers(rosters);
	  		console.log(rosters);
		});
	});
});  


