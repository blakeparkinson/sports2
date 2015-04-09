var express = require('express');
var router = express.Router();
var http = require("http");
var common = require('./common')
var config = common.config();
var _ = require('lodash'),
 	mongojs = require("mongojs"),
	db = mongojs.connect(config.mongo_uri);
var quizCutoffDate = new Date();
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago
    

router.get('/', function(req, res) {

	/*

	// Long shitty way that only pulls top 2
      
db.collection('quiz').aggregate([
		{ "$group": {
			"_id": {
				"league": "$league",
				"rb_team_id": "$rb_team_id"
			},
			"quizCount": { "$sum":1}
		}},
		{ "$group": {
			"_id": "$_id.league",
			"quizzes": {
				"$push": {
					"rb_team_id": "$_id.rb_team_id",
					"count": "$quizCount"
				},
			},
			"count": {"$sum": "$quizCount"}
		}},
		{ "$sort": {"count": -1} },
		{"$limit": 10},
		{"$unwind": "$quizzes"},
		{"$sort": { "count": 1, "quizzes.count": -1} },
		{ "$group": {
			"_id": "$_id",
			"quizzes": { "$push": "$quizzes"},
			"count": {"$first": "$count"}
		}},
		{ "$project": {
			"_id": {
				"_id": "$_id",
				"quizzes": "$quizzes",
				"count": "$count"
			},
			"newQuizzes": "$quizzes"
		}},
		{ "$unwind": "$newQuizzes"},
		{"$group": {
			"_id": "$_id",
			"num1": { "$first": "$newQuizzes"}
		}},
		{"$project": {
			"_id": "$_id",
			"num1": 1,
			"newQuizzes": 1,
			"seen": { "$eq": [
				"$num1",
				"$newQuizzes"
			]}
		}},
		{ "$match": { "seen": false } },
		{ "$group":{
			"_id": "$_id._id",
			"num1": {"$first": "$num1"},
			"num2": {"$first": "$newQuizzes"},
			"count": {"$first": "$_id.count"}
		}},
		{ "$project": {
			"num1": 1,
			"num2": 1,
			"count": 1,
			"type": { "$cond": [1, [true,false],0	]}
		}},
		{ "$unwind": "$type" },
		{"$project": {
			"quizzes": { "$cond": [
			"$type",
			"$num1",
			"$num2"
			]},
			"count":1
		}},
		{"$group": {
			"_id": "$_id",
			"count": {"$first": "$count" },
			"quizzes": { "$push": "$quizzes"}
		}},
		{"$sort": { "count": -1}}



], function (err, result){ 
	for (i=0;i<Object.keys(result).length; i++){
		console.log("id "+result[i]._id);
		console.log("c "+result[i].count);
		console.log("q "+result[i].quizzes[0].rb_team_id);
		console.log("q "+result[i].quizzes[0].count);
		console.log("q "+result[i].quizzes[1].rb_team_id);
		console.log("q "+result[i].quizzes[1].count);
	}

	*/





// SORTING ATTEMPT V2
db.collection('quiz').aggregate([
	{ "$group": {
			"_id": {
				"rb_team_id": "$rb_team_id",
				"league": "$league"
				
			},
			"quizCount": { "$sum":1}
		}},
		//{$unwind: "$league"},
		//{$sort: {"league.quizCount": -1}},
		//{$group: {"_id": "$_id", "league": {$push: "$league"} } }


], function (err, result){ 
	var all_leagues = team_array(result);
	var sorted_teams = team_sort(all_leagues);  // Sort the teams within each league by number of quizzes taken





/*
// SORTING ATTEMPT V3
db.collection('quiz').aggregate([
	{ "$group": {
			_id: "$quiz_name", 
			quiz_count: { $sum : 1 }
			}
		},
		{$sort: {"quiz_count": -1}}
			
		
		//{$unwind: "$league"},
		//{$sort: {"league.quizCount": -1}},
		//{$group: {"_id": "$_id", "league": {$push: "$league"} } }


], function (err, result){ 
	console.log("1"+Object.keys(result));
	console.log("result "+ result);
	for (i=0;i<Object.keys(result).length;i++){
		console.log("lala"+result[i]._id);
		console.log("quiz"+result[i].quiz_count);
	}

*/


res.render('leaguesearch',
	{ popular_teams: sorted_teams
	});		
}); 

})




 router.get('/:league', function(req, res) {
               var league = req.params.league;
      res.render('leaguesearch', {
       league: league
      });
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
