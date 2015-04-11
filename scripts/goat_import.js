// run this script by cd'ing into the scripts dir and 
//then typing "node team_alltime_import.js ['league']"
// for example to import nba, you do "node team_alltime_import.js nba"

var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var encryption = require('../encryption.js');
var request = require('request');
var api_key = '';
var ver = '';
var endpoint = '';
var teams = [];
var supported_leagues = ['nba'];
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


//process.argv grabs the command line arguments
var league = process.argv[2];

if (supported_leagues.indexOf(league) == -1){
  console.log('We cant do this league yet.');
  return
}

 
var loopThroughList = function (list){
  for (var i = 0; i < list.length; i++) { //this is looping through supported_nba_lists
    mongoInsert(list[i]);
  }
}

var mongoInsert = function (goatlist){
    db.open(function(err, db){
      db.collection('goats').insert(goatlist, function(err, insert){console.log("inserted?" + insert);});
    })
}



switch (league){
  case 'nba':
    loopThroughList(supported_nba_lists);
  } 




