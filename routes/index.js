var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
 	mongojs = require("mongojs"),
	db = mongojs.connect(common.mongo_uri);
var quizCutoffDate = new Date();
var ua = require('universal-analytics');
var visitor = ua(config.googleTrackingID);
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {
	var popular_quizzes = db.collection('quiz').aggregate(
	[{ "$match" : { "created_at" : { "$gt" : quizCutoffDate.toISOString().slice(0, 19).replace('T', ' ') }}},
	{ $group : {
		_id : {team_id: "$team_id", type: "$type", quiz_name: "$quiz_name"}, counts : {$sum: 1}
		}
	},
	{ $sort: {
		counts: -1
		}
	}], function(err, result){
		temparray = [];
		var endresult = [];
		if (result){
			temparray = result.slice(0,10)
			for (i=0;i<temparray.length;i++){
				team_info = temparray[i]._id;
				team_info.counts = temparray[i].counts;
        if (temparray.length - i == 1){
          //don't add a comma to the last team because that's bad english
          team_info.comma = '.';
        }
        else{
          team_info.comma = ','
        }
				endresult.push(team_info);
			}
		}

  var trending_quiz = {};
  if (typeof endresult !== 'undefined' && endresult){
    trending_quiz = endresult
  }
  visitor.pageview("/", "index", "http://rosterblitz.com").send();
	res.render('index',
  {
    session:req.session,
    trending_quiz: trending_quiz,
    how_works_button: true,
    special_layout: true,
    footer_class: 'index',
    no_social: true,
    title: "RosterBlitz - Put Your Sports Knowledge to the Ultimate Test"
  });
});
})

router.get('/get', function(req, res) {
    var term = req.query.q;
    res.render('../views/partials/player_card.hbs', {
    	layout: false,
    	data: data
		});

});




module.exports = router;
