var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
 	mongojs = require("mongojs"),
	db = mongojs.connect(config.mongo_uri);
var quizCutoffDate = new Date();
quizCutoffDate.setDate(quizCutoffDate.getDate() - 7);  //currently set to 1 week ago


router.get('/', function(req, res) {
	var popular_quizzes = db.collection('quiz').aggregate(
	[{ $project: {
		_id: 0,
		rb_team_id: 1,
		team_name: 1,
		Created_in_timeframe: {$cond: [{$lt: ['$created_at', quizCutoffDate]}, 1, 0]}
		}
	},
	{ $group : {
		_id : {rb_team_id: "$rb_team_id", team_name: "$team_name"}, counts : {$sum: '$Created_in_timeframe'} 
		}
	},
	{ $sort: {
		counts: -1
		}
	}], function(err, result){
		temparray = [];
		endresult = [];
		if (result){
			temparray.push(result.slice(0,3))
			temparray = _.first(temparray)
			for (i=0;i<temparray.length;i++){
				team_info = temparray[i]._id;
				counts = temparray[i].counts;
				team_info.counts = counts;
<<<<<<< HEAD
        if (temparray.length - i == 1){
          //don't add a comma to the last team because that's bad english
          team_info.comma = '';
        }
        else{
          team_info.comma = ','
        }
=======
>>>>>>> parent of c85b272... Fix for quiz_name, and sending popular quizzes to the FE
				endresult.push(team_info);
			}
		}
		return endresult; 
	});
	res.render('index', {session:req.session});
});




module.exports = router;
