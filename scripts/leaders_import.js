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
    db = mongojs.connect(common.mongo_uri);
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
    var teamId;

    switch (category){
      case "ppg": //points per game
        url = 'http://www.cbssports.com/nba/stats/playersort/nba/year-2014-season-regularseason-category-scoringpergame';
        teamId = '90000';
        break;
      case "rpg": //rebounds
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-rebounds';
        teamId = '90001';
        break;
      case "fieldGoalPercentage": //fieldgoals
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-fieldgoals';
        teamId = '90002';
        break;
      case "ftPercentage": //free throw
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-freethrows';
        teamId = '90003';
        break;
      case "threePointPercentage": //three point
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-threepoints';
        teamId = '90004';
        break;
      case "apg": //assists
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-assists';
        teamId = '90005';
        break;
      case "spg": //steals
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-steals';
        teamId = '90006';
        break;
      case "bpg": //blocks
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-blocks';
        teamId = '90007';
        break;
      case "tpg": //turnovers
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-turnovers';
        teamId = '90008';
        break;
      case "fpg": //fouls
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-fouls';
        teamId = '90009';
        break;
      case "mpg": //minutes
        url = 'http://www.cbssports.com/nba/stats/playersort/NBA/year-2014-season-regularseason-category-minutes';
        teamId = '90010';
        break;
      case "goals":
        url ="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-goals";
        teamId = '90011';
        break;
      case "assists":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-assists";
        teamId = '90012';
        break;
      case "points":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-points";
        teamId = '90013';
        break;
      case "wins":
        url ="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-wins";
        teamId = '90014';
        break;
      case "gaa":
        url ="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-goalsagainstaverage";
        teamId = '90015';
        break;
      case "savePercentage":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-savepercentage";
        teamId = '90016';
        break;
      case "penaltyMinutes":
        url="http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-penaltyminutes";
        teamId = '90017';
        break;
      case "fightingMajors":
        url = "http://www.cbssports.com/nhl/stats/teamsort/nhl/year-2014-season-regularseason-category-fightingmajors";
        teamId = '90018';
        break;
      case "penaltyMinutes":
        url = "http://www.cbssports.com/nhl/stats/playersort/nhl/year-2014-season-regularseason-category-penaltyminutes";
        teamId = '90019';
        break;
      case "passYards":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=9";
        teamId = '90020';
        break;
      case "passTD":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=12";
        teamId = '90021';
        break;
      case "passINT":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=13";
        teamId = '90022';
        break;
      case "compPercentage":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=7";
        teamId = '90023';
        break;
      case "qbRating":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-passing-qualifying-1?:sort_col=16";
        teamId = '90024';
        break;
      case "rushYards":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-rushing-qualifying-1?:sort_col=7";
        teamId = '90025';
        break;
      case "rushTD":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-rushing-qualifying-1?:sort_col=10";
        teamId = '90026';
        break;
      case "recYards":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-receiving-qualifying-1?:sort_col=6";
        teamId = '90027';
        break;
      case "recTD":
        url = "http://www.cbssports.com/nfl/stats/playersort/sortableTable/nfl/year-2014-season-regular-category-receiving-qualifying-1?:sort_col=11";
        teamId = '90028';
        break;
      case "tackles":
        url ="http://www.cbssports.com/nfl/stats/playersort/nfl/year-2014-season-regular-category-tackles";
        teamId = '90029';
        break;
      case "sacks":
        url ="http://www.cbssports.com/nfl/stats/playersort/nfl/year-2014-season-regular-category-sacks";
        teamId = '90030';
        break;
      case "interceptions":
        url ="http://www.cbssports.com/nfl/stats/playersort/nfl/year-2014-season-regular-category-interceptions";
        teamId = '90031';
        break;
      case "battingAvg":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting-qualifying-1?:sort_col=4";
        teamId = '90032';
        break;
      case "hr":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=10";
        teamId = '90033';
        break;
      case "rbi":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=11";
        teamId = '90034';
        break;
      case "sb":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=12";
        teamId = '90035';
        break;
      case "hittingBb":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=14";
        teamId = '90036';
        break;
      case "battingK":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=15";
        teamId = '90037';
        break;
      case "slg":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=17";
        teamId = '90038';
        break;
      case "ops":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=18";
        teamId = '90039';
        break;
      case "obp":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-batting?:sort_col=16";
        teamId = '90040';
        break;
      case "era":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=15";
        teamId = '90041';
        break;
      case "pitchingK":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=17";
        teamId = '90042';
        break;
      case "pitchingBb":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=16";
        teamId = '90043';
        break;
      case "whip":
        url ="http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=19";
        teamId = '90044';
        break;
      case "wins":
        url = "http://www.cbssports.com/mlb/stats/playersort/sortableTable/mlb/year-2015-season-regularseason-category-pitching-qualifying-1?:sort_col=7";
        teamId = '90045';
        break;
      case "eplGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&team=0&sort=3";
        teamId = '90046';
        break;
      case "eplShots":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=4";
        teamId = '90047';
        break;
      case "eplShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=5";
        teamId = '90048';
        break;
      case "eplAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=6";
        teamId = '90049';
        break;
      case "eplYc":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=8";
        teamId = '90050';
        break;
      case "eplRc":
        url = "http://www.foxsports.com/soccer/stats?competition=1&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=9";
        teamId = '90051';
        break;
      case "laligaGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=3";
        teamId = '90052';
        break;
      case "laligaShots":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=4";
        teamId = '90053';
        break;
      case "laligaShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=5";
        teamId = '90054';
        break;
      case "laligaAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=6";
        teamId = '90055';
        break;
      case "laligaYc":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=8";
        teamId = '90056';
        break;
      case "laligaRc":
        url = "http://www.foxsports.com/soccer/stats?competition=2&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=9";
        teamId = '90057';
        break;
      case "bundGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=3";
        teamId = '90058';
        break;
      case "bundShots":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=4";
        teamId = '90059';
        break;
      case "bundShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=5";
        teamId = '90060';
        break;
      case "bundAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=6";
        teamId = '90061';
        break;
      case "bundYc":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=8";
        teamId = '90062';
        break;
      case "bundRc":
        url = "http://www.foxsports.com/soccer/stats?competition=4&season=2014&category=STANDARD&team=0&sort=9";
        teamId = '90063';
        break;
      case "seriaAGoals":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=3";
        teamId = '90064';
        break;
      case "seriaAShots":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=4";
        teamId = '90065';
        break;
      case "seriaAShotsOnTarget":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=5";
        teamId = '90066';
        break;
      case "seriaAAssists":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=6";
        teamId = '90067';
        break;
      case "seriaAYc":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=8";
        teamId = '90068';
        break;
      case "seriaARc":
        url = "http://www.foxsports.com/soccer/stats?competition=3&season=2014&category=STANDARD&pos=0&team=0&splitType=0&sort=9";
        teamId = '90069';
        break;
    }
    // Call the core functionality now that we have the right variables.
    top_script(url, category, league, teamId, callback);
    },function (err) {
          if (err) { throw err; }
          console.log('done');
          });
  }

var top_script = function(url, category, league, teamId, callback1){
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
                data = {team_id : teamId, league: league, category: category};
                leadersList.league = league,
                leadersList.type = 'leaders',
                leadersList.description = teams_model.fetchStatDescription(category);
                leadersList.team_id = teamId;
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

var hackFormatSoccerPlayer = function(soccerPlayer){
  var id = shortId.generate();
  var formattedPlayer = {
    'player_id': id,
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
