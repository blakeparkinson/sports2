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

// this endpoint returns the entire nba season schedule
// grab that info, and for every team we have in that league in mongo, loop through and build that team's individual schedule
// Once we have a document with each team's individual schedule, we can use that game id to make the starting players calls

endpoint = 'https://api.sportsdatallc.org/nba-t3/games/2014/REG/schedule.json?api_key='+config.nba_key;
request(endpoint, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    formatNbaSched(response.body);
    db.collection('teams').find({'league': league}).toArray(function (err, items) {
      if (err) {
        console.log("error fetching teams")
      }
      else {
        teams_sched = [];  //This will be one array with each team's info as a separate element.
        // items are the list of teams in that league pulled from mongo
        for (i=0; i<items.length; i++){
          team_schedule = []; //This is one team's season information
          for (j=0; j<season_sched.length; j++){
            if (season_sched[j].game_home_team == items[i].team_id || season_sched[j].game_away_team == items[i].team_id){
              team_schedule.push({game_id: season_sched[j].game_id, game_date:season_sched[j].game_date.slice(0,10)});
            }
          }
          teams_sched.push({league: league, team_id: items[i].team_id, team_schedule: team_schedule});
        }
        mongoInsert(teams_sched);
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


function mongoInsert(teams_schedule){
  console.log("inserting into the DB");
  for (i=0;i<teams_schedule.length;i++){
    console.log("teams_schedule stuff"+teams_schedule[i].team_id);
    console.log("teams_schedule stuff"+teams_schedule[i].league);
    db.open(function(err, db){
      db.collection("schedule").update({team_id: teams_schedule.team_id},
      {$set: {team_id: teams_schedule[i].team_id, league: teams_schedule[i].league, team_schedule: teams_schedule[i].team_schedule}},
      {upsert: true, multi:false}, function (err, upserted){
        if (err) {
          console.log('Ahh! An Error with Insert!');
          return;
        }
      });
    });
  }
}


