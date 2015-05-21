// Run Script by: node leaders_import.js league (e.g. node leaders_import.js nba )

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var images = require('../lists/images2.js');
var _ = require('lodash');
var common = require('../routes/common')
var config = common.config();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var players_model = require('../models/players.js'),
    async = require('async');
var shortId = require('shortid');
var teams_model = require('../models/teams.js');

var supported_leagues = ['nba', 'nfl', 'nhl', 'mlb', 'eu_soccer'];
//process.argv grabs the command line arguments
var league = process.argv[2];

if (supported_leagues.indexOf(league) == -1){
  console.log('We cant do this '+league+' yet.');
  return
}


// In order to loop through all categories of the league, we need to have a shell function that just loops.
var main = function(league){
  switch (league){
    case "nba": 
      categories = ["ppg", "rpg", "fieldGoalPercentage", "ftPercentage", "threePointPercentage", "apg", "spg", "bpg", "tpg", "fpg", "mpg"];
      break;
    case "nhl":
      categories =["assists", "goals", "points", "wins",  "gaa", "savePercentage", "penaltyMinutes", "fightingMajors", "penaltyMinGame"];
      break;
    case "nfl":
      categories = ["passYards","passTD", "passINT", "compPercentage", "qbRating", "rushYards", "rushTD", "recYards", "recTD", "tackles", "sacks", "interceptions" ];
      break;
    case 'mlb':
      categories = ['battingAvg', 'hr', 'rbi', 'sb', 'hittingBb', 'battingK', 'slg', 'ops', 'obp', 'era', 'pitchingK', 'wins', 'whip', 'pitchingBb'];
    case 'eu_soccer':
      categories = ['eplGoals','eplShots', 'eplShotsOnTarget', 'eplAssists', 'eplYc', 'eplRc', 'laligaGoals','laligaShots', 'laligaShotsOnTarget', 'laligaAssists', 'laligaYc', 'laligaRc', 'bundGoals','bundShots', 'bundShotsOnTarget', 'bundAssists', 'bundYc', 'bundRc', 'seriaAGoals','seriaAShots', 'seriaAShotsOnTarget', 'seriaAAssists', 'seriaAYc', 'seriaARc',];
      break;
  }

    async.eachSeries(categories, function (category, callback) {

    switch (category){
      case "ppg": //points per game
        url = 'http://www.cbssports.com/nba/stats/playersort/nba/year-2014-season-regularseason-category-scoringpergame';
        break;
      case "rpg": //rebounds
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-rebounds';
        break;
      case "fieldGoalPercentage": //fieldgoals
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-fieldgoals';
        break;
      case "ftPercentage": //free throw
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-freethrows';
        break;
      case "threePointPercentage": //three point
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-threepoints';
        break;
      case "apg": //assists
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-assists';
        break;
      case "spg": //steals
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-steals';
        break;
      case "bpg": //blocks
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-blocks';
        break;
      case "tpg": //turnovers
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-turnovers';
        break;
      case "fpg": //fouls
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-fouls';
        break;
      case "mpg": //minutes
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-minutes';
        break;
      case "goals":
        url ="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-goals";
        break;
      case "assists":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-assists";
        break;
      case "points":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-points";
        break;
      case "wins":
        url ="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-wins";
        break;
      case "gaa":
        url ="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-goalsagainstaverage";
        break;
      case "savePercentage":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-savepercentage";
        break;
      case "penaltyMinutes":
        url="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-penaltyminutes";
        break;
      case "fightingMajors":
        url = "http://www.cbssports.com/nhl/stats/teamsort/nhl/year-2014-season-regularseason-category-fightingmajors";
        break;
      case "penaltyMinutes":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-penaltyminutes";
        break;
      case "passYards":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=9";
        break;
      case "passTD":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=12";
        break;
      case "passINT":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=13";
        break;
      case "compPercentage":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=7";
        break;
      case "qbRating":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=16";
        break;
      case "rushYards":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-rushing-qualifying-1?:sort_col=7";
        break;
      case "rushTD":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-rushing-qualifying-1?:sort_col=10";
        break;
      case "recYards":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-receiving-qualifying-1?:sort_col=6";
        break;
      case "recTD":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-receiving-qualifying-1?:sort_col=11";
        break;
      case "tackles":
        url ="http://www.cbssports.com/nfl/stats/playersort/nfl/year-2014-season-regular-category-tackles";
        break;
      case "sacks":
        url ="http://www.cbssports.com/nfl/stats/playersort/nfl/year-2014-season-regular-category-sacks";
        break;
      case "interceptions":
        url ="http://www.cbssports.com/nfl/stats/playersort/nfl/year-2014-season-regular-category-interceptions";
        break;
      case "battingAvg":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting-qualifying-1?:sort_col=4";
        break;
      case "hr":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=10";
        break;
      case "rbi":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=11";
        break;
      case "sb":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=12";
        break;
      case "hittingBb":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=14";
        break;
      case "battingK":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=15";
        break;
      case "slg":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=17";
        break;
      case "ops":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=18";
        break;
      case "obp":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=16";
        break;
      case "era":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=15";
        break;
      case "pitchingK":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=17";
        break;
      case "pitchingBb":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=16";
        break;
      case "whip":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=19";
        break;
      case "wins":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=7";
        break;
      case "eplGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&team=0&sort=3";
        break;
      case "eplShots":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=4";
        break;
      case "eplShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=5";
        break;
      case "eplAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=6";
        break;
      case "eplYc":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=8";
        break;
      case "eplRc":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=9";
        break;
      case "laligaGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=3";
        break;
      case "laligaShots":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=4";
        break;
      case "laligaShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=5";
        break;
      case "laligaAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=6";
        break;
      case "laligaYc":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=8";
        break;
      case "laligaRc":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=9";
        break;
      case "bundGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=3";
        break;
      case "bundShots":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=4";
        break;
      case "bundShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=5";
        break;
      case "bundAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=6";
        break;
      case "bundYc":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=8";
        break;
      case "bundRc":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=9";
        break;
      case "seriaAGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=3";
        break;
      case "seriaAShots":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=4";
        break;
      case "seriaAShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=5";
        break;
      case "seriaAAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=6";
        break;
      case "seriaAYc":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=8";
        break;
      case "seriaARc":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=9";
        break;
    }
    // Call the core functionality now that we have the right variables.
    top_script(url, category, league, callback);
    },function (err) {
          if (err) { throw err; }
          console.log('done');
          });
  }

var top_script = function(url, category, league, callback1){
  request(url, function(error, response, html){
    console.log("starting script for "+league+" category: "+category);

    if(!error){
      var $ = cheerio.load(html);

      var table = (league != 'eu_soccer')? '.data' : '.wisfb_statTableV2 >tbody';
     	//this is the table class name
      $(table).filter(function(){

     // Let's store the data we filter into a variable so we can easily see what's going on.
        var data = $(this);
        var results = [],
            soccerPlayers =[];
        //sort through their odd and even rows
        var tr = (league != 'eu_soccer')? data.find('.row1, .row2'): data.find('tr');
        tr.each(function(i, element){
          if (league != 'eu_soccer'){
            var player = $(this).find('td:first-child').text();
            var team = $(this).find('td:nth-child(3)').text();
            var top = $(this).find('td.sort').text();
          }
          else{
            var player = $(this).find('td:nth-child(2) .wisfb_dataContainer a:nth-child(1)').text();
            var team = $(this).find('td:nth-child(2) .wisfb_doubleLink a:nth-child(2)').text();
            var top = $(this).find('td.wisfb_selected .wisfb_dataContainer').text();
          }
          var metadata = {
            name: player,
            top: top,
            team: players_model.abbreviationHelper(league,team)  // Consolidates abbreviation differences between sites
          };
          results.push(metadata);
        })

        async.eachSeries(results, function (player, callback) {
          if (league == 'eu_soccer'){
            var soccerPlayer = hackFormatSoccerPlayer(player);
            soccerPlayers.push(soccerPlayer);
            callback();
          }
          else{
            //async lib is weird, you pass it a callback and it calls back and lets you know when it has finished for each loop
            players_model.pluckPlayerFromName(player, callback, league);
          }

          
        }, function (err) {
          if (err) { throw err; }
            var leadersList = {},
                id = shortId.generate(),
                data = {team_id : id, league: league, category: category};
                leadersList.league = league,
                leadersList.type = 'leaders',
                leadersList.description = teams_model.fetchStatDescription(category);
                leadersList.team_id = id;
                leadersList.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
                leadersList.category = category;
            if (league == 'eu_soccer'){
              data.players = soccerPlayers;
            }
            players_model.insertLeaders(data);
            mongoInsert(leadersList);
            console.log('done with '+category);
            callback1();
          });
      })
    }
    else{
      console.log("there was an error with "+ category);
    }
  })
}

main(league);

var hackFormatSoccerPlayer = function(soccerPlayer, callback){
  var id = shortId.generate();
  var formattedPlayer = {
    'id': id,
    'full_name': soccerPlayer.name,
    'last_name': soccerPlayer.name.substring(soccerPlayer.name.indexOf(' ') + 1), //get rid of the space and everything before it to get last name
    'stat': soccerPlayer.top
  };

  return formattedPlayer;
}


var mongoInsert = function (leadersList){
  console.log("leadersList.team_id into Teams"+leadersList.team_id);
  db.open(function(err, db){
    db.collection('teams').update({"$and" : [{league: leadersList.league},{category: leadersList.category}, {type: leadersList.type}]},
      {$set: leadersList},
      {upsert: true, multi: false}, function (err, upserted){
        if (err){
          console.log("error inserting into mongo" + err);
        }       
      }
    )
  })
}
