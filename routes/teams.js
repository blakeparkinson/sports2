var common = require('./common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('underscore');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var dataAgeCutOff = 86400000;
var teams = [];


//<<<<<<< HEAD
router.get('/', function(res, res) {
      res.render('teams', {
      });
    });


//this is for the /teams page search field ajax
router.get('/team', function(req, res) {
    var term = req.query.q;
    console.log(term);
    //find the team, This syntax does a sql-type like clause with case insensitivity with the RegEx
    db.collection('teams').find({$or: [{'name': new RegExp(term, 'i')}, {'market': new RegExp(term, 'i')}]}).sort({'market': 1}).toArray(function (err, items) {
    	res.json(items);
    });
});


// when players endpoint is hit, call the API/DB using that team_id
router.get('/players', function(req, res) {
  team_id = req.query["team_id"];
  players = fetchPlayers(team_id, res, returnPlayers);
});

var returnPlayers = function (players, res){
    res.json(players);
}

// Check the db first. If it's there and has been added in the last 24 hours, use it. 
// Otherwise, go get new data from the API and replace/add the database listing
var fetchPlayers = function(team_id, res, callback){
  db.collection('players').find({team_id : team_id}).toArray(function (err, items){
    if (items.length > 0){ // data in Mongo
      var itemdate = _.first(items['last_updated']);
      var datenow = new Date();
      var datecutoff = datenow.getTime() - dataAgeCutOff;
      if (datecutoff > itemdate){   //data is old so call API
        var players = fetchPlayersFromApi(team_id,res,callback)
      }
      else {  // data is fine so just return it
        callback(items, res);
      }
    }
    else {  // data not already in Mongo
      var players = fetchPlayersFromApi(team_id,res,callback)
    }
  });
}



var fetchPlayersFromApi = function(team_id,res,callback){
var json_response = '';
var players = {};
  request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team_id+'/statistics.json?api_key='+config.nba_key, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      json_response = JSON.parse(body);
      players = formatPlayers(json_response, team_id);
      mongoInsertPlayers(team_id, players);
      callback(players, res)
    } 
  }); 
}

// flatten players, average, & total objects into one level
var formatPlayers = function(response, team_id){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){
      if (key != "total" && key != "average"){
        var value = response.players[i][key];
        playersarray[i][key] = value;
      }
      else if (key =="total"){
        for(var key in response.players[i].total) {
          var value = response.players[i].total[key];
          playersarray[i]["total_"+key] = value;
        }
      }
      else {
        for(var key in response.players[i].average) {
          var value = response.players[i].average[key];
          playersarray[i]["average_"+key] = value;
        }
      }
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

  

module.exports = router;

