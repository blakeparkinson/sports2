var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);



router.get('/', function(req, res) {
    if (req.user){
        if (req.user.provider === 'twitter'){
            req.user.twitter = true;
        }

        else if (req.user.provider === 'facebook'){
            req.user.facebook = true;
        }
    }
      res.render('teams', {user:req.user});
    });

//this is for the /teams page search field ajax
router.get('/team', function(req, res) {
    var term = req.query.q;
    console.log(term);

    //find the team, This syntax does a sql-type like clause with case insensitivy(sp???) with the RegEx
    db.collection('teams').find({$or: [{'name': new RegExp(term, 'i')}, {'market': new RegExp(term, 'i')}]}).sort({'market': 1}).toArray(function (err, items) {
    	res.json(items);
    });
});

module.exports = router;
