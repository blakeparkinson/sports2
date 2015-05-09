var express = require('express');
var router = express.Router();
var http = require("http");
var common = require('./common')
var config = common.config();
var _ = require('lodash'),
   mongojs = require("mongojs"),
   async = require('async'),
  db = mongojs.connect(config.mongo_uri);
var quizCutoffDate = new Date()
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {

  async.parallel({
    goat_lists: fetchGoatLists,
    //this (bind) is the syntax you use to pass arguments via async lib.
    //passing false here because we don't filter
    leaders_lists: fetchLeadersLists.bind(null, false)
  }, function(err,results){
      res.render('leaguesearch',
        { popular_teams: results.goat_lists,
        	leaders: results.leaders_lists
         }
    );  
  })

});

var fetchLeadersLists = function(league, callback, rb_team_id){
	var data = {};
  data.type = 'leaders';  
	if (league){
		//do filtering
		data.league = league
	}
  db.collection('teams').find(data).toArray(function (err, items){
    callback(null, items);
  });
}

var fetchGoatLists = function(callback){
  db.collection('quiz').aggregate(

  [{ "$match" : { "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }} //only pull quizzes in timeframe
  },
  { "$group": {
      "_id": {
        "rb_team_id": "$rb_team_id",
        "league": "$league",
        "quiz_name": "$quiz_name"
      },
      "quizCount": { "$sum": 1}
    }}, {
      "$sort": {"quizCount": -1}
    }, {
      "$limit": 10
    }

  ], function (err, result){ 
      if (result.length > 0){
        teams = [];
        for (i=0;i<Object.keys(result).length;i++){
            var team = {};
            team.rb_team_id = result[i]._id.rb_team_id;
            team.league = result[i]._id.league;
            team.team_name = result[i]._id.quiz_name;
            team.quizCount = result[i].quizCount;
            teams.push(team);
          }
        console.log("TEAMS"+teams);
      }
    callback(null, teams);  
  }); 
}

var fetchGoatListsByLeague = function(league, callback){
	db.collection('quiz').aggregate(
    [{ "$match" : {"$and" : [{ "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }}, {"league" : league} ] }
    },
  { "$group": {
      "_id": {
        "rb_team_id": "$rb_team_id",
        "league": "$league",
        "quiz_name": "$quiz_name"
      },
      "quizCount": { "$sum": 1}
    }}, {
      "$sort": {"quizCount": -1}
    }, {
      "$limit": 10
    }

  ], function (err, result){
      teams = []; 
      if (result.length > 0){
        for (i=0;i<Object.keys(result).length;i++){
          var team = {};
          team.rb_team_id = result[i]._id.rb_team_id;
          team.league = result[i]._id.league;
          team.team_name = result[i]._id.quiz_name;
          team.quizCount = result[i].quizCount;
          teams.push(team);
        }
        console.log("TEAMS"+teams);
      }
    callback(null, teams);  
  })
}

var randImg = function() {      
  var images = [];      
  var path = '../images/epic_photos/';          
              
  images[0] = "hockey.jpg",
  images[1] = "locker_room1.jpg",
  images[2] = "locker_room2.jpg";            
            
  var image = images[Math.floor(Math.random()*images.length)];
  image = path + image;
  return image;    
}

router.get('/:league', function(req, res) {
  var league = req.params.league;
  async.parallel({
  	//this (bind) is the syntax you use to pass arguments via async lib.
    goat_lists: fetchGoatListsByLeague.bind(null,league),
    leaders_lists: fetchLeadersLists.bind(null, league)
  }, function(err,results){
      res.render('leaguesearch',
        { popular_teams: results.goat_lists,
        	leaders: results.leaders_lists,
          background_image: randImg(),
          how_works_button: true
         }
    );  
  })

})


function compareCounts(a,b) {
  if (a.quizCount < b.quizCount)
     return 1;
  if (a.quizCount > b.quizCount)
    return -1;
  return 0;
}


module.exports = router;
