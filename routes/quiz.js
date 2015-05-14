var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http");
    mongojs = require("mongojs"),
    clock = '2:00';
    db = mongojs.connect(config.mongo_uri);
var players_model = require('../models/players.js');
var leaders_model = require('../models/leaders.js');
var leaguesearch = require('./leaguesearch.js');
    
router.get('/', function(req, res) {
      res.quiz_page = true;
      var quiz_id = req.query.id;
      db.collection('quiz').findOne( { _id : quiz_id}, function(err, items){
        rb_team_id = items.rb_team_id;
        league = items.league;
        api_team_id = items.api_team_id;
        quiz_name = items.quiz_name;
        type = items.type;
        if (players_model.goatsLeadersArray().indexOf(type) > -1){ // leaders or goats
          // pass the colors function an empty string so we get defaults
          var colors = players_model.fetchTeamColors(league, '');
          leaders_model.fetchLeadersLists(type, league, function(doc){
            res.render('quiz', {
              clock: clock,
              roster: doc.players,
              league: doc.league,
              rb_team_id: doc.team_id,
              remove_footer: true,
              team_name: doc.description,
              primary_hex: colors.primary_hex,
              secondary_hex: colors.secondary_hex,
              type: type,
              plainDisplay: true
            })
          }, rb_team_id)
        }
        else {
          //it's type 'roster'
          db.collection('teams').findOne( { _id : rb_team_id}, function (err, items){
            team_id = items.team_id;       // API team id
            usat_id = items.usat_id;
          
            if (!rb_team_id || !league){
            	//it's the short url, so let's look up by quiz id to find the other info
                db.collection('quiz').findOne({_id : quiz_id},function (err, doc){
                    players = players_model.fetchPlayers(type, doc.team_id, doc.rb_team_id, doc.league, doc.usat_id, res, players_model.intreturnPlayers, players_model.returnPlayers);
                });
            }
            else{
              players = players_model.fetchPlayers(type, team_id, rb_team_id, league, usat_id, res, req, players_model.intreturnPlayers, players_model.returnPlayers);
            }
          });
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
