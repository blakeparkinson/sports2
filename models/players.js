var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('underscore');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var dataAgeCutOff = 604800000;  //This is 1 week in milliseconds
var teams = [];
var endpoint = '';
var parseString = require('xml2js').parseString;
var players = [];

var returnPlayers = function (players, res){
    res.json(players);
}

// Check the db first. If it's there and has been added in the last 24 hours, use it. 
// Otherwise, go get new data from the API and replace/add the database listing
var fetchPlayers = function(team_id, league, res, callback){
  
  db.collection('players').find({team_id : team_id}).toArray(function (err, items){
    if (items.length > 0){ // data in Mongo
      var itemdate = _.first(items['last_updated']);
      var datenow = new Date();
      var datecutoff = datenow.getTime() - dataAgeCutOff;
      if (datecutoff > itemdate){   //data is old so call API
        var players = fetchPlayersFromApi(team_id, league, res, callback)
      }
      else {  // data is fine so just return it
        callback(items, res);
      }
    }
    else {  // data not already in Mongo
      var players = fetchPlayersFromApi(team_id, league, res, callback)
    }
  });
}


var fetchPlayersFromApi = function(team_id, league, res, callback){
var json_response = '';
var players = {};

switch (league){
  case 'nba':
    endpoint = 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team_id+'/statistics.json?api_key=' + config.nba_key;
    break;
  case 'nfl':
    endpoint = 'https://api.sportsdatallc.org/nfl-t1/teams/'+team_id+'/2014/REG/statistics.json?api_key='+ config.nfl_key;
    break;
  case 'nhl':
    endpoint = 'https://api.sportsdatallc.org/nhl-t3/seasontd/2014/REG/teams/'+team_id+'/statistics.json?api_key='+ config.nhl_key;
    break;
  case 'eu_soccer':
    endpoint = 'https://api.sportsdatallc.org/soccer-t2/eu/teams/'+team_id+'/profile.xml?api_key='+config.soccer_eu_key;
}

    request(endpoint, function (error, response, body) {
      if (!error && response.statusCode == 200) {
             switch (league){
               case 'nba':
               case 'nfl':
               case 'nhl':
                json_response = JSON.parse(body);
                players = formatPlayers(json_response, team_id);
                mongoInsertPlayers(team_id, players);
                callback(players, res)
                break;
               case 'eu_soccer':
                playersParsed = formatEUSoccerPlayers(response.body);
                players = formatPlayersDocument(team_id, playersParsed);
                mongoInsertPlayers(team_id, players);
                callback(players, res)
                break;
              }
      }
      else{
        console.log('something really terrible has happened');
      }
    });
}


var formatPlayers = function(response, team_id){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){   //all
      var value = response.players[i][key];
      playersarray[i][key] = value;
    }
  }
  var team = formatPlayersDocument(team_id, playersarray);
  return team;
}
 

var formatPlayersDocument = function(team_id, players){
  teamDocument = {};
  teamDocument["team_id"] = team_id;
  teamDocument["players"] = players; 
  return teamDocument;
}


function mongoInsertPlayers(team_id, team_document){
  console.log("inserting into the DB");
  db.open(function(err, db){
    db.collection("players").update({team_id: team_id},
    {$set: {team_id: team_document["team_id"], last_updated: new Date(), players: team_document["players"]}},
    {upsert: true, multi:false}, function (err, upserted){
      if (err) {
        console.log('Ahh! An Error!');
        return;
      }
    });
  });
}


formatEUSoccerPlayers = function(response){
  parseString(response, function (err, result) {
    var str = result[Object.keys(result)[0]];
      for (i=0; i < str.team.length;i++){
        for (j=0; j < str.team[i].roster.length; j++){
          for (k=0; k < str.team[i].roster[j].player.length; k++){
            players.push(str.team[i].roster[j].player[k].$);
          }
        }
      }
  });
  return players;
}



module.exports = {
  returnPlayers: returnPlayers,
  fetchPlayersFromApi: fetchPlayersFromApi,
  fetchPlayers: fetchPlayers,
  formatPlayers: formatPlayers,
  formatPlayersDocument: formatPlayersDocument,
  mongoInsertPlayers: mongoInsertPlayers
}