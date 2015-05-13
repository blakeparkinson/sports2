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

//process.argv grabs the command line arguments
var league = process.argv[2];

// In order to loop through all categories of the league, we need to have a shell function that just loops.
var main = function(league){
  switch (league){
    case "nba": 
      categories = ["ppg", "rpg", "fieldGoalPercentage", "ftPercentage", "threePointPercentage", "apg", "spg", "bpg", "tpg", "fpg", "mpg"];
      break;
    case "nhl":
      categories =["assists", "goals", "points", "wins",  "gaa", "savePercentage", "penaltyMinutes", "fightingMajors", "penaltyMinGame"];
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


    }
    // Call the core functionality now that we have the right variables.
    top_script(url, category, callback);
    },function (err) {
          if (err) { throw err; }
          console.log('done');
          });
  }

var top_script = function(url, category, callback1){
  request(url, function(error, response, html){
    console.log("starting script for "+league+" category: "+category);

    if(!error){
      var $ = cheerio.load(html);

     	//this is the table class name
      $('.data').filter(function(){

     // Let's store the data we filter into a variable so we can easily see what's going on.
        var data = $(this);
        var results = [];
        //sort through their odd and even rows
        var tr = data.find('.row1, .row2')
        tr.each(function(i, element){
          var player = $(this).find('td:first-child').text();
          var team = $(this).find('td:nth-child(3)').text();
          var top = $(this).find('td.sort').text();
          var metadata = {
            name: player,
            top: top,
            team: players_model.abbreviationHelper(league,team)  // Consolidates abbreviation differences between sites
          };
          results.push(metadata);
        })
        async.eachSeries(results, function (player, callback) {
          //async lib is weird, you pass it a callback and it calls back and lets you know when it has finished for each loop
          players_model.pluckPlayerFromName(player, callback, league);
        }, function (err) {
          if (err) { throw err; }
            var leadersList = {},
                id = shortId.generate(),
                data = {team_id : id, league: league, category: category};
                leadersList.league = league,
                leadersList.type = 'leaders',
                leadersList.description = teams_model.fetchStatDescription(category);
                leadersList.team_id = id,
                leadersList.created_at: new Date().toISOString().slice(0, 19).replace('T', ' ');
                leadersList.category = category;
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
