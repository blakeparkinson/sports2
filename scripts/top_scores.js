// Possible NBA categories: ppg, rpg, fieldGoalPercentage, ftPercentage, threePointPercentage, apg, spg, bpg, tpg, fpg, mpg
// Run Script by: node top_scores league category (e.g. node top_scores nba ppg)

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


//process.argv grabs the command line arguments
var league = process.argv[2];
var category = process.argv[3];


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
}
    
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
                    team: abbreviation_helper(team)  // Consolidates abbreviation differences between sites
                  };
                  results.push(metadata);
                })
                async.eachSeries(results, function (player, callback) {
                  //async lib is weird, you pass it a callback and it calls back and lets you know when it has finished for each loop
                  players_model.pluckPlayerFromName(player, callback);
                }, function (err) {
                  if (err) { throw err; }
                    players_model.insertTopScorers(league, category);
                    console.log('done');
                  });

            })
        }
        else{
          console.log('pp');
        }
    })


var abbreviation_helper = function(abbreviation){
  var replace = abbreviation
  switch (abbreviation){
    case 'GS': 
      replace = 'GSW'
      break;
    case 'NO': 
      replace = 'NOP'
      break;
    case 'NY': 
      replace = 'NYK'
      break;
    case 'SA': 
      replace = 'SAS'
      break;
    case 'PHO': 
      replace = 'PHX'
      break;
  }
  return replace
}

