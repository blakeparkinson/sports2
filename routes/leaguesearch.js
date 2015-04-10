var express = require('express');
var router = express.Router();
var http = require("http");
var common = require('./common')
var config = common.config();
var _ = require('lodash'),
 	mongojs = require("mongojs"),
	db = mongojs.connect(config.mongo_uri);
var quizCutoffDate = new Date()
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {
	 db.collection('quiz').aggregate(


	[{ "$match" : { "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }} //only pull quizzes in timeframe
	},
	{ "$group": {
			"_id": {
				"rb_team_id": "$rb_team_id",
				"league": "$league"
			},
			"quizCount": { "$sum": 1}
		}}

	], function (err, result){ 
		if (result){
			var all_leagues = team_array(result);
			var sorted_teams = team_sort(all_leagues);  // Sort the teams within each league by number of quizzes taken
		}
		res.render('leaguesearch',
			{ popular_teams: sorted_teams }
		);		
	}); 
})



// HAVE NOT TESTED THIS CODE YET
router.get('/:league', function(req, res) {
	var league = req.params.league;
	db.collection('quiz').aggregate(
		[{ "$match" : {"$and" : [{ "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }}, {"league" : league} ] }
		},
		{ "$group": {
				"_id": {
					"rb_team_id": "$rb_team_id",
					"league": "$league"
				},
				"quizCount": { "$sum": 1}
			}}
		], function (err, result){  // in this case, result is one league object with an array of teams
			if (result){
				//var all_leagues = team_array(result);
				var sorted_teams = team_sort(result);  // Sort the teams within the league by number of quizzes taken
				for (i=0;i<sorted_teams[0].length;i++){
					console.log(quizCutoffDate);
					console.log("moop"+sorted_teams[0][i].rb_team_id);
					console.log("muup"+sorted_teams[0][i].quizCount);

				}  //will remove once I've tested
			}

		res.render('leaguesearch', {
			league: sorted_teams
		});
	})
})



var team_array = function(teamobject){
	var teams = [];
	var nba_teams = [];
	var nfl_teams = [];
	var eu_soccer_teams = [];
	var nhl_teams = [];
	var goats_teams = [];
	for (i=0;i<Object.keys(teamobject).length;i++){
		var team = {};
		team.rb_team_id = teamobject[i]._id.rb_team_id;
		team.league = teamobject[i]._id.league;
		team.quizCount = teamobject[i].quizCount;
		if (team.league == "nba"){
			nba_teams.push(team);
		}
		else if (team.league == "goats"){
			goats_teams.push(team);
		}
		else if (team.league == "eu_soccer"){
			eu_soccer_teams.push(team);
		}
		else if (team.league == "nhl"){
			nhl_teams.push(team);
		}
		else if (team.league == "nfl"){
			nfl_teams.push(team);
		}
		else{
			console.log("not in leagues");
		}	
	}
	teams.push(nba_teams);
	teams.push(goats_teams);
	teams.push(eu_soccer_teams);
	teams.push(nhl_teams);
	teams.push(nfl_teams);
	return teams
}


var team_sort = function(teamsarray){
	for (i=0;i<Object.keys(teamsarray).length;i++){ 
		currentleague = teamsarray[i];
		var sorted = currentleague.sort(comparecounts);
		teamsarray[i] = sorted
	}
	return teamsarray
}




function comparecounts(a,b) {
  if (a.quizCount < b.quizCount)
     return 1;
  if (a.quizCount > b.quizCount)
    return -1;
  return 0;
}












module.exports = router;
