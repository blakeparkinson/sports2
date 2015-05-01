var express = require('express');
var router = express.Router();
var http = require("http");
var common = require('./common')
var config = common.config();
var _ = require('lodash'),
   mongojs = require("mongojs"),
   async = require('async'),
  db = mongojs.connect(config.mongo_uri);
var quizCutoffDate = new Date()
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {

  async.parallel({
    goat_lists: fetchGoatLists,
    //this (bind) is the syntax you use to pass arguments via async lib.
    //passing false here because we don't filter
    leaders_lists: fetchLeadersLists.bind(null, false)
  }, function(err,results){
      res.render('leaguesearch',
        { popular_teams: results.goat_lists,
        	leaders: results.leaders_lists
         }
    );  
  })

});

var fetchLeadersLists = function(league, callback){
	var data = {};
	if (league){
		//do filtering
		data.league = league
	}
  db.collection('leaders').find(data).toArray(function (err, items){
    callback(null, items);
  });
}

var fetchGoatLists = function(callback){
  db.collection('quiz').aggregate(

  [{ "$match" : { "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }} //only pull quizzes in timeframe
  },
  { "$group": {
      "_id": {
        "rb_team_id": "$rb_team_id",
        "league": "$league",
        "quiz_name": "$quiz_name"
      },
      "quizCount": { "$sum": 1}
    }}

  ], function (err, result){ 
    if (result.length > 0){
      var all_leagues = createTeamLists(result);
      var sorted_teams = sortTeams(all_leagues);  // Sort the teams within each league by number of quizzes taken
    }
    callback(null,sorted_teams);  
  }); 
}

var fetchGoatListsByLeague = function(league,callback){
	db.collection('quiz').aggregate(
    [{ "$match" : {"$and" : [{ "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }}, {"league" : league} ] }
    },
    { "$group": {
        "_id": {
          "rb_team_id": "$rb_team_id",
          "league": "$league",
          "quiz_name": "$quiz_name"
        },
        "quizCount": { "$sum": 1}
      }
    }], function(err, result){
      if (result.length > 0){
        teams = [];
        for (i=0;i<Object.keys(result).length;i++){
            var team = {};
            team.rb_team_id = result[i]._id.rb_team_id;
            team.league = result[i]._id.league;
            team.team_name = result[i]._id.quiz_name;
            team.quizCount = result[i].quizCount;
            teams.push(team);
          }
        sorted_teams = teams.sort(compareCounts);
      }
      callback(null, sorted_teams);  
  })
}


router.get('/:league', function(req, res) {
  var league = req.params.league;
  async.parallel({
  	//this (bind) is the syntax you use to pass arguments via async lib.
    goat_lists: fetchGoatListsByLeague.bind(null,league),
    leaders_lists: fetchLeadersLists.bind(null, league)
  }, function(err,results){
      res.render('leaguesearch',
        { popular_teams: results.goat_lists,
        	leaders: results.leaders_lists
         }
    );  
  })

})


var createTeamLists = function(teamobject){
  var teams = {};
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
    team.team_name = teamobject[i]._id.quiz_name;
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
    teams.nba=nba_teams;
    teams.goats_teams=goats_teams;
    teams.eu_soccer_teams = eu_soccer_teams;
    teams.nhl_teams=nhl_teams;
    teams.nfl_teams = nfl_teams;
    teams.mlb_teams = mlb_teams;
  return teams
}



var sortTeams = function(teamsobject){
  for (var key in teamsobject){
    teamsobject[key].sort(compareCounts);
  }
  return teamsobject
}


function compareCounts(a,b) {
  if (a.quizCount < b.quizCount)
     return 1;
  if (a.quizCount > b.quizCount)
    return -1;
  return 0;
}


module.exports = router;
