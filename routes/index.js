var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri, ["teams"]);

router.get('/', function(req, res) {
    if (req.user){
        if (req.user.provider === 'twitter'){
            req.user.twitter = true;
        }

        else if (req.user.provider === 'facebook'){
            req.user.facebook = true;
        }
    }
      res.render('index', {user:req.user});
    });





module.exports = router;

