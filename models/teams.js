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

var clearRedisTeam = function(teamID){
  var redisClient = common.redisClient;
  redisClient.set(teamID, null);
}

/** TODO HAVE HONREE POPULATE DESCRIPTIONS WITH THIS FUNCTION **/
var fetchStatDescription = function(stat, listType, league){
  switch(stat) {
    case "ppg": //points per game
        description = 'NBA Most Points per game';
        break;
      case "rpg": //rebounds
        description = 'NBA Most Rebounds per game';
        break;
      case "fieldGoalPercentage": //fieldgoals
        description = 'NBA Highest Field goal percentage';
        break;
      case "ftPercentage": //free throw
        description = 'NBA Highest Free throw percentage';
        break;
      case "threePointPercentage": //three point
        description = 'NBA Highest Three points percentage';
        break;
      case "apg": //assists
        description = 'NBA Most Assists per game';
        break;
      case "spg": //steals
        description = 'NBA Most Steals per game';
        break;
      case "bpg": //blocks
        description = 'NBA Most Blocks per game';
        break;
      case "tpg": //turnovers
        description = 'NBA Most Turnovers per game';
        break;
      case "fpg": //fouls
        description = 'NBA Most Fouls per game';
        break;
      case "mpg": //minutes
        description = 'NBA Most Minutes per game';
        break;
      case "eplGoals":
        description = "Top EPL Goal Scorers";
        break;
      case "eplShots":
        description = "Top EPL Shot Takers";
        break;
      case "eplShotsOnTarget":
        description = "Top EPL Shots on Target";
        break;
      case "eplAssists":
        description = "Top EPL Assisters";
        break;
      case "eplYc":
        description = "Most EPL Yellow Cards";
        break;
      case "eplRc":
        description = "Most EPL Red Cards";
        break;
      case "laligaGoals":
        description = "Top La Liga Goal Scorers";
        break;
      case "laligaShots":
        description = "Top La Liga Shot Takers";
        break;
      case "laligaShotsOnTarget":
        description = "Top La Liga Shots on Target";
        break;
      case "laligaAssists":
        description = "Top La Liga Assisters";
        break;
      case "laligaYc":
        description = "Most La Liga Yellow Cards";
        break;
      case "laligaRc":
        description = "Most La Liga Red Cards";
        break;
      case "bundGoals":
        description = "Top Bundesliga Goal Scorers";
        break;
      case "bundShots":
        description = "Top Bundesliga Shot Takers";
        break;
      case "bundShotsOnTarget":
        description = "Top Bundesliga Shots on Target";
        break;
      case "bundAssists":
        description = "Top Bundesliga Assisters";
        break;
      case "bundYc":
        description = "Most Bundesliga Yellow Cards";
        break;
      case "bundRc":
        description = "Most Bundesliga Red Cards";
        break;
      case "seriaAGoals":
        description = "Top Series A Goal Scorers";
        break;
      case "seriaAShots":
        description = "Top Series A Shot Takers";
        break;
      case "seriaAShotsOnTarget":
        description = "Top Series A Shots on Target";
        break;
      case "seriaAAssists":
        description = "Top Series A Assisters";
        break;
      case "seriaAYc":
        description = "Most Series A Yellow Cards";
        break;
      case "seriaARc":
        description = "Most Series A Red Cards";
        break;
      case "assists":
        description = "NHL Most Assists";
        break;
      case "goals":
        description = "NHL Most Goals";
        break;
      case "points":
        description = "NHL Most Points";
        break;
      case "wins":
        description = "NHL Most Wins";
        break;
      case "gaa":
        description = "NHL Lowest Goals Against";
        break;
      case "savePercentage":
        description = "NHL Highest Save Percentage";
        break;
      case "penaltyMinutes":
        description = "NHL Most Penalty Minutes";
        break;
      case "fightingMajors":
        description = "NHL Most Fighting Majors";
        break;
      case "penaltyMinGame":
        description = "NHL Most Penalty Minutes per Game";
        break;
      case "passYards":
        description = "NFL Passing Yards (season)";
        break;
      case "passTD":
        description = "NFL Most Passing Touchdowns (season)";
        break;
      case "passINT":
        description = "NFL Most Interceptions thrown (season)";
        break;
      case "compPercentage":
        description = "NFL Highest Completion Percentage (season)";
        break;
      case "qbRating":
        description = "NFL Highest QB Rating (season)";
        break;
      case "rushYards":
        description = "NFL Most Rushing Yards (season)";
        break;
      case "rushTD":
        description = "NFL Most Rushing TDs (season)";
        break;
      case "recYards":
        description = "NFL Most Receiving Yards (season)";
        break;
      case "recTD":
        description = "NFL Most Receiving TDs (season)";
        break;
      case "tackles":
        description = "NFL Most Tackles (season)";
        break;
      case "sacks":
        description = "NFL Most Sacks (season)";
        break;
      case "Interceptions":
        description = "NFL Most Interceptions (season)";
        break;
      case "battingAvg":
        description = "MLB Highest Batting Average (season)";
        break;
      case "hr":
        description = "MLB Most Home Runs (season)";
        break;
      case "rbi":
        description = "MLB Most RBIs (season)";
        break;
      case "sb":
        description = "MLB Most Stolen Bases (season)";
        break;
      case "hittingBb":
        description = "MLB Most Walks Drawn (season)";
        break;
      case "battingK":
        description = "MLB Strikeouts - Batting (season)";
        break;
      case "slg":
        description = "MLB Highest Slugging (season)";
        break;
      case "ops":
        description = "MLB Highest OPS (season)";
        break;
      case "obp":
        description = "MLB Highest OBP (season)";
        break;
      case "era":
        description = "MLB Lowest ERA (season)";
        break;
      case "pitchingK":
        description = "MLB Most Strikeouts - Pitching (season)";
        break;
      case "wins":
        description = "MLB Most Wins (season)";
        break;
      case "whip":
        description = "MLB Lowest WHIP (season)";
        break;
      case "pitchingBb":
        description = "MLB Most Walks = pitching (season)";
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

var randomIntFromInterval = function (min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}


module.exports = {
  deleteItem: deleteItem,
  fetchStatDescription: fetchStatDescription,
  createQuiz: createQuiz,
  clearRedisTeam: clearRedisTeam,
  randomIntFromInterval: randomIntFromInterval
}
