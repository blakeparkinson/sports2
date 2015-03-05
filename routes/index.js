var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);


router.get('/', function(req, res) {
      res.render('index', {session:req.session});
    });




var popular_quizzes = db.collection('quiz').aggregate( [ 
{ $project: {
        _id: 0,
        rb_team_id: 1,
        Created_in_timeframe: {$cond: [{$lt: ['$created_at', oneWeekAgo]}, 1, 0]}
        //    dateDifference:                 {$subtract: [ new Date(), "$date" ] } 
        //Created_in_timeframe: {$cond: [{$gt: ['$created_at', {$subtract: [new Date(), 6048000000000000000000]}]}, 1, 0]}
    }},

{ 
	$group : { _id : "$rb_team_id", counts : {$sum: '$Created_in_timeframe'} }   
    } ], function(err, result){
        console.log(result);
        return result;
    } );









module.exports = router;

