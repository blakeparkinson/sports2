var express = require('express');
var router = express.Router();
var http = require("http");
var common = require('./common')
var config = common.config();
var _ = require('lodash'),
   mongojs = require("mongojs"),
   async = require('async'),
  db = mongojs.connect(common.mongo_uri);
var quizCutoffDate = new Date()
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {
  var listObjRosters = {league : false, type: 'roster'};
  var listObjLeaders = {league : false, type: 'leaders'};
  var listObjGoats = {league : false, type: 'goats'};
  async.parallel({
    popular_lists: fetchTeamLists.bind(null,listObjRosters),
    //this (bind) is the syntax you use to pass arguments via async lib.
    //passing false here because we don't filter
    goats_lists: fetchLeadersLists.bind(null, listObjGoats),
    leaders_lists: fetchLeadersLists.bind(null, listObjLeaders)
  }, function(err,results){
      res.render('leaguesearch',
        { popular_teams: results.popular_lists,
          goats: results.goats_lists,
        	leaders: results.leaders_lists,
          remove_footer: true,
          special_layout: true,
          title: "RosterBlitz - Search by League"
         }
    );
  })

});


router.get('/:league', function(req, res) {
  var league = req.params.league;
  if (league == 'soccer'){
    league = 'eu_soccer';
  }
  var changeTitle = function(league) {
    if (league == 'eu_soccer') {
      var title = "RosterBlitz - Soccer Quizzes";
    } else {
      var title = "RosterBlitz - " + league.toUpperCase() + " Quizzes";
    }
    return title;
  }
  var listObjGoats = {league : league, type: 'goats'};
  var listObjRosters = {league : league, type: 'roster'};
  var listObjLeaders = {league : league, type: 'leaders'};
  async.parallel({
    //this (bind) is the syntax you use to pass arguments via async lib.
    popular_lists: fetchTeamListsByLeague.bind(null,listObjRosters),
    goats_lists: fetchLeadersLists.bind(null, listObjGoats),
    leaders_lists: fetchLeadersLists.bind(null, listObjLeaders)
  }, function(err,results){
      res.render('leaguesearch',
        { popular_teams: results.popular_lists,
          goats: results.goats_lists,
          leaders: results.leaders_lists,
          background__roster_image: imageByLeague(league),
          how_works_button: true,
          special_layout: true,
          current: league,
          footer_class: 'index',
          title: changeTitle(league)
         }
    );
  })

})


var fetchLeadersLists = function(listObj, callback){
	var data = {};
  data.type = listObj["type"];
	if (listObj["league"]){
		//do filtering
		data.league = listObj["league"]
	}
  db.collection('teams').find(data).toArray(function (err, items){
    callback(null, items);
  });
}


var fetchTeamLists = function(listObj, callback){
  var type = listObj["type"];
  db.collection('quiz').aggregate(

  [{ "$match" : { "$and": [{ "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }}, {"type": type }]} //only pull quizzes in timeframe and for rosters
  },
  { "$group": {
      "_id": {
        "team_id": "$team_id",
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
            team.team_id = result[i]._id.team_id;
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


var fetchTeamListsByLeague = function(listObj, callback){
  var type = listObj["type"];
  if (listObj["league"]){
    //do filtering
    var league = listObj["league"];
  }

	db.collection('quiz').aggregate(
    [{ "$match" : {"$and" : [{ "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }}, {"league" : league}, {"type" : type} ] }
    },
  { "$group": {
      "_id": {
        "team_id": "$team_id",
        "league": "$league",
        "quiz_name": "$quiz_name",
        "type": "$type"
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
          team.team_id = result[i]._id.team_id;
          team.league = result[i]._id.league;
          team.team_name = result[i]._id.quiz_name;
          team.quizCount = result[i].quizCount;
          team.type = result[i]._id.type;
          teams.push(team);
        }
        console.log("TEAMS"+teams);
      }
    callback(null, teams);
  })
}

/*
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
*/

var imageByLeague = function(league) {
  switch(league) {
    case "nba":
      var image = 'basketball_epic3.jpg';
      break;
    case "nhl":
      var image = 'hockey_epic3.jpg';
      break;
    case "nfl":
      var image = 'epic_football3.jpg';
      break;
    case "mlb":
      var image = 'baseball_epic.jpg';
      break;
    case "soccer":
      var image = 'soccer_epic2.jpg';
      break;
    default:
      var image = 'soccer_epic2.jpg';
  }
  var path = '../images/epic_photos/';
  var image = path + image;
  return image;
}

function compareCounts(a,b) {
  if (a.quizCount < b.quizCount)
     return 1;
  if (a.quizCount > b.quizCount)
    return -1;
  return 0;
}


module.exports = router;
