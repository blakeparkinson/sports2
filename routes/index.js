var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var timeFrameAgo = new Date();
timeFrameAgo.setDate(timeFrameAgo.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {
	var popular_quizzes = db.collection('quiz').aggregate(
		[{ $project: {
				_id: 0,
				rb_team_id: 1,
				Created_in_timeframe: {$cond: [{$lt: ['$created_at', timeFrameAgo]}, 1, 0]}
			}
		},
		{ $group : {
				_id : "$rb_team_id", counts : {$sum: '$Created_in_timeframe'} 
			}
		},
		{ $sort: {
				counts: -1
				}
		}], function(err, result){
				newresult = [];
				newresult.push(result.slice(0,3))
				newresult = _.first(newresult)
				console.log(newresult);
				return newresult;
		}
	);
	res.render('index', {session:req.session});
});




module.exports = router;

