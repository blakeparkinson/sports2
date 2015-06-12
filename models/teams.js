var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(common.mongo_uri);
var shortId = require('shortid');

//helper for deleting 
var deleteItem = function(data, collectionName){
  db.open(function(err, db){
    db.collection(collectionName,{},function(err, collection){
      collection.remove(data,function(err, removed){
        console.log(removed);
      });
    });
  });
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
      default:
        description = stat;
        break;
  }
  return description;
}

var createQuiz = function(team_id, league, quiz_name, res, callback, api_team_id, type){
  db.open(function(err, db){
    db.collection("quiz").insert({_id:shortId.generate(), team_id: team_id, type:type, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), league: league, api_team_id: api_team_id, quiz_name: quiz_name, quiz_score: "null"}, function (err, item){
        if (err){
          console.log("new quiz insert failed: "+ err);
        }
        else {
          callback(item[0], res);
        }
    });
  });
}


module.exports = {
  deleteItem: deleteItem,
  fetchStatDescription: fetchStatDescription,
  createQuiz: createQuiz
}
