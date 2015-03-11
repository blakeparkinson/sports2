var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http");
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var players_model = require('../models/players.js');
    

router.get('/', function(req, res) {
      res.quiz_page = true;
      var quiz_id = req.query.id,
          rb_team_id = req.query.team_id,  // rb team id
          league = req.query.league;
          db.collection('teams').findOne( { _id : rb_team_id}, function (err, items){
            team_id = items.team_id;       // API team id
          
            if (!rb_team_id || !league){
            	//it's the short url, so let's look up by quiz id to find the other info
                db.collection('quiz').findOne({_id : quiz_id},function (err, doc){
                    players = players_model.fetchPlayers(doc.team_id, doc.rb_team_id, doc.league, res, players_model.returnPlayers);
                });
            }
            else{
              players = players_model.fetchPlayers(team_id, rb_team_id, league, res, req, players_model.returnPlayers);
            }

      });

  });


router.get('/results', function(req, res) {
  var quiz_id = req.query.quiz_id,
    quiz_score = req.query.quiz_score;
    db.open(function(err, db){
      db.collection("quiz").update({_id: quiz_id},
      {$set: {quiz_score: quiz_score}},
      {upsert: true, multi:false}, function (err, upserted){
        if (err){
          console.log(err);
          res.json({success: false});
        }
        else {
          res.json({success: true});
        }
      });
    });
});
          

module.exports = router;
