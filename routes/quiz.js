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
  db.collection('quiz').findOne( { _id : quiz_id}, function(err, item){
    rb_team_id = item.rb_team_id;
    league = item.league;
    api_team_id = item.api_team_id;
    quiz_name = item.quiz_name;
    type = item.type;
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
      db.collection('teams').findOne( { team_id : rb_team_id}, function (err, items){
        team_id = items.team_id;       // API team id
        usat_id = items.usat_id;
      
        if (!rb_team_id || !league){
        	//it's the short url, so let's look up by quiz id to find the other info
            db.collection('quiz').findOne({_id : quiz_id},function (err, doc){
                players = players_model.fetchPlayers(type, doc.api_team_id, doc.rb_team_id, doc.league, doc.usat_id, res, players_model.intreturnPlayers, players_model.returnPlayers);
            });
        }
        else{
          players = players_model.fetchPlayers(type, api_team_id, rb_team_id, league, usat_id, res, req, players_model.intreturnPlayers, players_model.returnPlayers);
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
  db.collection('quiz').find({ "rb_team_id" : rb_team_id}, {percentage_correct: 1}, function(err, items){
    percentages = []
    if (err){
      console.log(err);
    }
    else {
      for (i=0;i<Object.keys(items).length;i++){
        percentages.push(items[i].percentage_correct);
      }
      // Assign each quiz score to a bucket for graph display
      bracketQuizScores(req, percentages);
    }
  })
}


var bracketQuizScores = function(req, percentage_array){
  lowScores = 0;
  mlowScores = 0;
  medScores = 0;
  mhighScores = 0;
  highScores = 0;
  
  for (i=0;i<percentage_array.length;i++){
    if (percentage_array[i] == null){console.log("meh")}
    else if (percentage_array[i] < 0.20){lowScores++}
    else if (percentage_array[i]>= 0.20 && percentage_array[i] < 0.40){mlowScores++}
    else if (percentage_array[i]>= 0.40 && percentage_array[i] < 0.60){medScores++}
    else if (percentage_array[i]>= 0.60 && percentage_array[i] < 0.80){mhighScores++}
    else if (percentage_array[i] >= 0.80){highScores++}
    else{console.log("ignore")}
  }
  req.session.scores = {low: lowScores, mlow:mlowScores , med:medScores, mhigh:mhighScores, high:highScores};
}
          
module.exports = router;
