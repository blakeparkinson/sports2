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
  var rb_team_id = null;
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
    // Calculate all other scores for this team in the background
    fetchQuizScores(req, rb_team_id);
  });
})
 

router.get('/results', function(req, res) {
  var quiz_id = req.query.quiz_id,
    quiz_score = req.query.quiz_score,
    possible_score = req.query.possible_score,
    percentage_correct = +((quiz_score / possible_score).toFixed(2));
    db.open(function(err, db){
      db.collection("quiz").update({_id: quiz_id},
      {$set: {quiz_score: quiz_score, possible_score: possible_score, percentage_correct: percentage_correct}},
      {upsert: true, multi:false}, function (err, upserted){
        if (err){
          console.log(err);
          res.json({success: false});
        }
        else {
          res.json({all_scores: req.session.scores, this_score: percentage_correct, success: true});
        }
      });
    });
});


// Pull all raw quiz scores for that team_id
var fetchQuizScores = function(req, rb_team_id){
  db.collection('quiz').find({ "rb_team_id" : rb_team_id}, {league: 1, quiz_score: 1, possible_score: 1}, function(err, items){
    mod_scores = []
    if (err){
      console.log(err);
    }
    else {
      for (i=0;i<Object.keys(items).length;i++){
        if (league == "nfl"){
          modifiedscore = items[i].quiz_score / 5
          mod_scores.push(modifiedscore);
        }
        else{
          modifiedscore = items[i].quiz_score / 3
          mod_scores.push(modifiedscore);
        }
      }
      // Assign each quiz score to a bucket for graph display
      bracketQuizScores(req, mod_scores);
    }
  })
}


var bracketQuizScores = function(req, mod_scores){
  lowScores = 0;
  mlowScores = 0;
  medScores = 0;
  mhighScores = 0;
  highScores = 0;
  
  for (i=0;i<mod_scores.length;i++){
    if (mod_scores[i] == null){console.log("meh")}
    else if (mod_scores[i] < 1){lowScores++}
    else if (mod_scores[i]>= 1 && mod_scores[i] < 2){mlowScores++}
    else if (mod_scores[i]>= 2 && mod_scores[i] < 3){medScores++}
    else if (mod_scores[i]>= 3 && mod_scores[i] < 4){mhighScores++}
    else if (mod_scores[i] >= 4){highScores++}
    else{console.log("ignore")}
  }
  req.session.scores = {low: lowScores, mlow:mlowScores , med:medScores, mhigh:mhighScores, high:highScores};
}
          
module.exports = router;
