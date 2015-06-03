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
var teams_model = require('../models/teams.js');


router.get('/', function(req, res) {
  res.quiz_page = true;
  var quiz_id = req.query.id;
  var tId = req.query.team_id;

  if (typeof tId != 'undefined' && typeof quiz_id == 'undefined'){
    //we've only been given a team id and that's it!. Look up the needed info and create a quiz from there.
    db.collection('teams').findOne( { team_id : tId}, function (err, item){
         if (players_model.goatsLeadersArray().indexOf(item.type) > -1){
          var api_team_id = null;
          var quiz_name = item.category;
        }
        else{
          var api_team_id = item.api_team_id;
          var quiz_name = item.market + ' ' + item.name;
        }
        teams_model.createQuiz(tId, item.league, quiz_name, res, redirectQuiz, api_team_id, item.type);
    });
    //createQuiz method will actually route back to this function. Jump out now that we've done the work
    return;
  }


  db.collection('quiz').findOne( { _id : quiz_id}, function(err, item){
    team_id = item.team_id;
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
          team_id: doc.team_id,
          remove_footer: true,
          team_name: doc.description,
          primary_hex: colors.primary_hex,
          secondary_hex: colors.secondary_hex,
          type: type,
          plainDisplay: true,
          quizPage: true
        })
      }, team_id)
    }
    else {
      //it's type 'roster'
      db.collection('teams').findOne( { team_id : team_id}, function (err, items){
        team_id = items.team_id;       // API team id
        usat_id = items.usat_id;
      
        if (!team_id || !league){
        	//it's the short url, so let's look up by quiz id to find the other info
            db.collection('quiz').findOne({_id : quiz_id},function (err, doc){
                players = players_model.fetchPlayers(type, doc.api_team_id, doc.team_id, doc.league, doc.usat_id, res, players_model.intreturnPlayers, players_model.returnPlayers);
            });
        }
        else{
          players = players_model.fetchPlayers(type, api_team_id, team_id, league, usat_id, res, req, players_model.intreturnPlayers, players_model.returnPlayers);
        }
      });
    }
    // Calculate all other scores for this team in the background
    fetchQuizScores(req, team_id);
  });
})
 

router.get('/results', function(req, res) {
  var quiz_id = req.query.quiz_id,
    league = req.query.league,
    quiz_score = req.query.quiz_score,
    possible_score = req.query.possible_score,
    percentage_correct = +((quiz_score / possible_score).toFixed(2)),
    mod_scores = req.session.scores.all_scores;
    if (league == "nfl"){
      modified_score = quiz_score / 5;
    }
    else {
      modified_score = quiz_score / 3
    }
    req.session.scores.this_score = modified_score
    mod_scores.push(modified_score); // add this quiz's score to the all scores array
    mod_scores.sort()
    req.session.scores.all_scores = mod_scores
    calculatePercentile(req, modified_score, mod_scores);

    db.open(function(err, db){
      db.collection("quiz").update({_id: quiz_id},
      {$set: {quiz_score: quiz_score, possible_score: possible_score, percentage_correct: percentage_correct, modified_score: modified_score}},
      {upsert: true, multi:false}, function (err, upserted){
        if (err){
          console.log(err);
          res.json({success: false});
        }
        else {
          appendCurrentScore(modified_score, req.session.scores.brackets);
          res.json({scores: req.session.scores, success: true});
        }
      });
    });
});


var redirectQuiz = function(item, res){
   res.writeHead(302, {'Location': '/quiz?team_id='+item.team_id+'&id='+item._id+'&league='+item.league});
   res.end();
}

/* Takes in a sorted array that includes the historical scores and the new score. Sorted position / length = percentile. 
Optimistic way of calculating. Ex scores 0,1,1,2,3 and you scored one of the 1's, you will be in the 60th percentile. */
var calculatePercentile = function(req, score, all_scores){
  len = all_scores.length;
  count = 0;
  for (i=0;i<all_scores.length;i++){
    if (len == 1){ // if you're the first taker, you get 100th percentile
      req.session.scores.percentile = 1
      return;
    }
    else if(all_scores[i]<= score && count < len -1){
      count++
    }
    else if (all_scores[i]<= score && count == len - 1){
      count++
      percentile = (count/len)*100
      req.session.scores.percentile = percentile
      return;
    }
    else if (all_scores[i]> score){
      percentile = (count/len)*100
      req.session.scores.percentile = percentile
      return;
    }
  }
}



// Pull all raw quiz scores for that team_id
var fetchQuizScores = function(req, team_id){
  db.collection('quiz').find({ "team_id" : team_id}, {modified_score: 1}, function(err, items){
    mod_scores = [];
    if (err){
      console.log(err);
    }
    else {
      for (i=0;i<Object.keys(items).length;i++){
          if (items[i].modified_score != null){
            mod_scores.push(items[i].modified_score);
          }
        }
      }
    req.session.scores = {};
    req.session.scores.all_scores = mod_scores;
    // Assign each quiz score to a bucket for graph display
    bracketQuizScores(req, mod_scores);
  })
}

var appendCurrentScore = function(score, previousScoresObj){
    if (score < 1){previousScoresObj.low++}
    else if (score>= 1 && score < 2){previousScoresObj.mlow++}
    else if (score>= 2 && score < 3){previousScoresObj.med++}
    else if (score>= 3 && score < 4){previousScoresObj.mhigh++}
    else if (score>= 4 && score < 5){previousScoresObj.high++}
    else if (score >= 5){previousScoresObj.shigh++}
}


var bracketQuizScores = function(req, mod_scores){
  lowScores = 0;
  mlowScores = 0;
  medScores = 0;
  mhighScores = 0;
  highScores = 0;
  shighScores = 0;
  
  for (i=0;i<mod_scores.length;i++){
    if (mod_scores[i] == null){console.log("null score")}
    else if (mod_scores[i] < 1){lowScores++}
    else if (mod_scores[i]>= 1 && mod_scores[i] < 2){mlowScores++}
    else if (mod_scores[i]>= 2 && mod_scores[i] < 3){medScores++}
    else if (mod_scores[i]>= 3 && mod_scores[i] < 4){mhighScores++}
    else if (mod_scores[i]>= 4 && mod_scores[i] < 5){highScores++}
    else if (mod_scores[i] >= 5){shighScores++}
    else{console.log("fyi: we have bad scores in mongo")}
  }
  req.session.scores.brackets = {low: lowScores, mlow:mlowScores , med:medScores, mhigh:mhighScores, high:highScores, shigh: shighScores};
}
          
module.exports = router;
