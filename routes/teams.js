var common = require('./common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('underscore');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var players_model = require('../models/players.js');


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

  players = players_model.fetchPlayers(team_id, league, res, players_model.returnPlayers);
});



  

module.exports = router;

