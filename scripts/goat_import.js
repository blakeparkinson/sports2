// run this script by cd'ing into the scripts dir and 
//then typing "node goat_import.js ['league']"
// for example to import nba, you do "node goat_import.js nba"

var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(common.mongo_uri);
var encryption = require('../encryption.js');
var request = require('request');
var api_key = '';
var ver = '';
var endpoint = '';
var teams = [];
var supported_leagues = ['nba', 'nhl', 'mlb', 'nfl'];
var shortId = require('shortid');

// NBA LISTS
var apg_alltime = require('../lists/nba/apg_alltime.js');
var bpg_alltime = require('../lists/nba/bpg_alltime.js');
var fieldGoalPercentage_alltime = require('../lists/nba/fieldGoalPercentage_alltime.js');
var ftPercentage_alltime = require('../lists/nba/ftPercentage_alltime.js');
var ppg_alltime = require('../lists/nba/ppg_alltime.js');
var rpg_alltime = require('../lists/nba/rpg_alltime.js');
var spg_alltime = require('../lists/nba/spg_alltime.js');
var threePointPercentage_alltime = require('../lists/nba/threePointPercentage_alltime.js');

var supported_nba_lists = [apg_alltime.topAPG, bpg_alltime.topBPG, fieldGoalPercentage_alltime.fieldGoalPercentage, ftPercentage_alltime.ftPercentage, ppg_alltime.topPPG, rpg_alltime.topRPG, spg_alltime.topSPG, threePointPercentage_alltime.threePointPercentage];

//NHL LISTS
var mostAssists = require('../lists/nhl/mostAssists.js');
var mostGoals = require('../lists/nhl/mostGoals.js');
var mostPoints = require('../lists/nhl/mostPoints.js');
var highestSavePercentage = require('../lists/nhl/highestSavePercentage.js');
var mostShutoutsNHL = require('../lists/nhl/mostShutoutsNHL.js');

var supported_nhl_lists = [mostAssists.mostAssists, mostGoals.mostGoals, mostPoints.mostPoints, mostShutoutsNHL.mostShutoutsNHL, highestSavePercentage.highestSavePercentage];


// MLB LISTS
var mostHits = require('../lists/mlb/mostHits.js');
var mostHomeRuns = require('../lists/mlb/mostHomeRuns.js');
var bestBattingAverage = require('../lists/mlb/bestBattingAverage.js');
var mostRBIs = require('../lists/mlb/mostRBIs.js');
var mostSavesByPitcher = require('../lists/mlb/mostSavesByPitcher.js');
var mostShutoutsByPitcher = require('../lists/mlb/mostShutoutsByPitcher.js');
var mostStolenBases = require('../lists/mlb/mostStolenBases.js');
var mostWinsByPitcher = require('../lists/mlb/mostWinsByPitcher.js');

var supported_mlb_lists = [mostHits.mostHits, mostHomeRuns.mostHomeRuns, bestBattingAverage.bestBattingAverage, mostRBIs.mostRBIs, mostSavesByPitcher.mostSavesByPitcher, mostShutoutsByPitcher.mostShutoutsByPitcher, mostStolenBases.mostStolenBases, mostWinsByPitcher.mostWinsByPitcher];

// NFL LISTS
var mostPassingTD = require('../lists/nfl/mostPassingTD.js');
var mostRushingYards = require('../lists/nfl/mostRushingYards.js');
var bestPasserRating = require('../lists/nfl/bestPasserRating.js');
var mostPassingYards = require('../lists/nfl/mostPassingYards.js');
var mostReceivingTDs = require('../lists/nfl/mostReceivingTDs.js');
var mostReceivingYards = require('../lists/nfl/mostReceivingYards.js');
var mostRushingTDs = require('../lists/nfl/mostRushingTDs.js');

var supported_nfl_lists = [mostPassingTD.mostPassingTD, mostRushingYards.mostRushingYards, bestPasserRating.bestPasserRating, mostPassingYards.mostPassingYards, mostReceivingTDs.mostReceivingTDs, mostReceivingYards.mostReceivingYards, mostRushingTDs.mostRushingTDs];

//process.argv grabs the command line arguments
var league = process.argv[2];

if (supported_leagues.indexOf(league) == -1){
  console.log('We cant do this league yet.');
  return
}

 
var loopThroughList = function (list){
  for (var i = 0; i < list.length; i++) { //this is looping through supported lists
    mongoInsert(list[i]);
  }
}

var mongoInsert = function (goatlist){
    var created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.open(function(err, db){
      for (var i = 0; i < goatlist.length; i++){
        goatlist[i].created_at = created_at;
        console.log("upserting "+goatlist[i].category+" into mongo goats");
        db.collection('goats').update({"$and" : [{league: goatlist[i].league},{category: goatlist[i].category}, {type: goatlist[i].type}]},
        {$set: goatlist[i]},
        {upsert: true, multi: false}, function (err, upserted){
          if (err){
            console.log("error inserting into mongo" + err);
          }       
        }
      )} 
    })
    db.open(function(err, db){
      for (var i = 0; i < goatlist.length; i++){
        console.log("upserting "+goatlist[i].category+" into mongo teams");
        db.collection('teams').update({"$and" : [{league: goatlist[i].league},{category: goatlist[i].category}, {type: goatlist[i].type}]},
        {$set: {league: goatlist[i].league, team_id: goatlist[i].team_id, category: goatlist[i].category, type: goatlist[i].type, description: goatlist[i].description, keywords: goatlist[i].keywords, created_at: created_at}},
        {upsert: true, multi: false}, function (err, upserted){
          if (err){
            console.log("error inserting into mongo" + err);
          }       
        }
      )}
    })
}



switch (league){
  case 'nba':
    loopThroughList(supported_nba_lists);
  case 'nhl':
    loopThroughList(supported_nhl_lists);
  case 'mlb':
    loopThroughList(supported_mlb_lists);
  case 'nfl':
    loopThroughList(supported_nfl_lists);
  } 




