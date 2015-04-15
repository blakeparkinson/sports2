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
			var all_leagues = createTeamLists(result);
			var sorted_teams = sortTeams(all_leagues);  // Sort the teams within each league by number of quizzes taken
		}
		res.render('leaguesearch',
			{ popular_teams: sorted_teams }
		);		
	}); 
})



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
			if (result.length > 0){
				var temparray = [];
				temparray.push(result);
				var sorted_teams = sortTeams(temparray);  // Sort the teams within the league by number of quizzes taken
			}

		res.render('leaguesearch', {
			league: sorted_teams
		});
	})
})



var createTeamLists = function(teamobject){
	var teams = [];
	var nba_teams = [];
	var nfl_teams = [];
	var eu_soccer_teams = [];
	var nhl_teams = [];
	var goats_teams = [];
	var mlb_teams = [];
	for (i=0;i<Object.keys(teamobject).length;i++){
		var team = {};
		team.rb_team_id = teamobject[i]._id.rb_team_id;
		team.league = teamobject[i]._id.league;
		team.quizCount = teamobject[i].quizCount;
		switch (team.league){
			case 'nba':
				nba_teams.push(team);				
				break;
			case 'goats':
				goats_teams.push(team);				
				break;
			case 'eu_soccer':
				eu_soccer_teams.push(team);				
				break;
			case 'nhl':
				nhl_teams.push(team);				
				break;
			case 'nfl':
				nfl_teams.push(team);				
				break;
			case 'mlb':
				mlb_teams.push(team);				
		}}

	teams.push(nba_teams, goats_teams, eu_soccer_teams, nhl_teams, nfl_teams, mlb_teams);
	return teams
}


var sortTeams = function(teamsarray){
	for (i=0;i<Object.keys(teamsarray).length;i++){ 
		currentleague = teamsarray[i];
		var sorted = currentleague.sort(compareCounts);
		teamsarray[i] = sorted
	}
	return teamsarray
}


function compareCounts(a,b) {
  if (a.quizCount < b.quizCount)
     return 1;
  if (a.quizCount > b.quizCount)
    return -1;
  return 0;
}


module.exports = router;
