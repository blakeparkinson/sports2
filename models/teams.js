var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var shortId = require('shortid');

//helper for deleting teams
var deleteTeam = function(data){
  db.open(function(err, db){
    db.collection('teams',{},function(err, collection){
      collection.remove(data,function(err, removed){
        console.log(removed);
      });
    });
  });
}

module.exports = {
  deleteTeam: deleteTeam,
  fetchStatDescription: fetchStatDescription
}

/** TODO HAVE HONREE POPULATE DESCRIPTIONS WITH THIS FUNCTION **/
var fetchStatDescription = function(stat, listType, league){
  switch(stat) {
    case "ppg": //points per game
        description = 'Points per game';
        break;
      case "rpg": //rebounds
        description = 'Rebounds per game';
        break;
      case "fieldGoalPercentage": //fieldgoals
        description = 'Field goal percentage';
        break;
      case "ftPercentage": //free throw
        description = 'Free throw percentage';
        break;
      case "threePointPercentage": //three point
        description = 'Three points percentage';
        break;
      case "apg": //assists
        description = 'Assists per game';
        break;
      case "spg": //steals
        description = 'Steals per game';
        break;
      case "bpg": //blocks
        description = 'Blocks per game';
        break;
      case "tpg": //turnovers
        description = 'Turnovers per game';
        break;
      case "fpg": //fouls
        description = 'Fouls per game';
        break;
      case "mpg": //minutes
        description = 'Minutes per game';
        break;
  }
  return description;
}
