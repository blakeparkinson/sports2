var common = require('./common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('underscore');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var dataAgeCutOff = 86400000;  //This is 24 hours in milliseconds
var teams = [];
var endpoint = '';


router.get('/', function(res, res) {
      res.render('teams', {
      });
    });


// when quiz endpoint is hit, insert a new quiz into mongo and return quiz_id
router.get('/quiz', function(req, res) {
  id = req.query["id"];   //this is the rosterblitz id, not the API one
  quiz = createQuiz(id, res, returnItem);
});

// made the return more universal for all callbacks
var returnItem = function (item, res){
  res.json(item);
}

var createQuiz = function(rb_team_id, res, callback){
  db.open(function(err, db){
    db.collection("quiz").insert({team_id: rb_team_id}, function (err, insert){
        if (err){
          console.log("new quiz insert failed");
        }
        else {
          var quiz_id = _.first(insert)._id;
          callback(quiz_id, res);
        }
    });
  });
}


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
  league = req.query["league"];
  players = fetchPlayers(team_id, league, res, returnItem);
});


// Check the db first. If it's there and has been added in the last 24 hours, use it. 
// Otherwise, go get new data from the API and replace/add the database listing
var fetchPlayers = function(team_id, league, res, callback){
  db.collection('players').find({team_id : team_id}).toArray(function (err, items){
    if (items.length > 0){ // data in Mongo
      var itemdate = _.first(items['last_updated']);
      var datenow = new Date();
      var datecutoff = datenow.getTime() - dataAgeCutOff;
      if (datecutoff > itemdate){   //data is old so call API
        var players = fetchPlayersFromApi(team_id,league, res,callback)
      }
      else {  // data is fine so just return it
        callback(items, res);
      }
    }
    else {  // data not already in Mongo
      var players = fetchPlayersFromApi(team_id,league, res,callback)
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

  

module.exports = router;

