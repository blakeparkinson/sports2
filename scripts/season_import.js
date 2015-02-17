// run this script by cd'ing into the scripts dir and 
//then typing "node season_import.js [league you want to import]"
// for example to import nba, you do "node season_import.js nba"


var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var request = require('request');

var supported_leagues = ['nba'];

//process.argv grabs the command line arguments
var league = process.argv[2];

var season_sched = [];


if (supported_leagues.indexOf(league) == -1){
  console.log('We cant do this league yet.');
  return
}

// gathers a list of teams in the league. We'll match this with season info
var gatherTeams = function(){
var teams = db.collection('teams').find({'league': league}).toArray(function (err, items) {
		if (err) {
			console.log("error fetching teams")
		}
		return teams;
	});
}



// call the season api. Build new object with the season info we want.

endpoint = 'https://api.sportsdatallc.org/nba-t3/games/2014/REG/schedule.json?api_key='+config.nba_key;
request(endpoint, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		formatNbaSched(response.body);
		db.collection('teams').find({'league': league}).toArray(function (err, items) {
			if (err) {
				console.log("error fetching teams")
			}
			else {
				// items are the list of teams in that league pulled from mongo
				for (i=0; i<items.length; i++){
					team_sched_document = [];
					team_schedule = [];
					for (j=0; j<season_sched.length; j++){
						if (season_sched[j].game_home_team == items[i].team_id || season_sched[j].game_away_team == items[i].team_id){
							team_schedule.push({game_id: season_sched[j].game_id, game_date:season_sched[j].game_date});
						}
					}
					team_sched_document.push({league: league, team_id: items[i].team_id, team_schedule: team_schedule});
					console.log(team_sched_document);
				//console.log(team_sched_document);
				}
			}
		});		
	}
	else {
		console.log("ruh rohs");
	}
})




var formatNbaSched = function(response){
  var  hierarchy_response = JSON.parse(response);
  for (i=0;i<hierarchy_response.games.length;i++){
  		var game_id = hierarchy_response.games[i].id;
  		var game_date = hierarchy_response.games[i].scheduled;
  		var home_team = hierarchy_response.games[i].home.id; 
  		var away_team = hierarchy_response.games[i].away.id;  
        season_sched.push({game_id: game_id,game_date:game_date,game_home_team:home_team, game_away_team:away_team});
      }
return season_sched;
}





/*switch (league){
	case 'nba':
		
		});

		//endpoint = 'https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + config.nba_key;
		break;
}

    request(endpoint, function (error, response, body) {
		if (!error && response.statusCode == 200) {
            switch (league){
	        	case 'nba':
	            	console.log("Weeeeee");
      			}
      	else {
        	console.log('somethings really terrible happened');
      	}
    }
})*/

  

  function mongoInsert(teams){
    db.open(function(err, client){
      client.collection("teams", function(err, col) {
        for (var i = 0; i < teams.length; i++) {
          if (league == 'eu_soccer'){
              //soccer teams don't really have markets, their names include their citys. For our puropses (rendering), this will go into the market field
              col.insert({team_id:teams[i].id, market:teams[i].name, name: '', country:teams[i].country, league:league}, function() {});
          }
          else{
            //really the only 4 key:value pairs we care about for now
            col.insert({team_id:teams[i].id, name:teams[i].name, market:teams[i].market, league:league}, function() {});
          }
        }
      })
  });

}