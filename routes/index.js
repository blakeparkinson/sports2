var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri, ["teams"]);

    var test = {"test": 1};

router.get('/', function(req, res) {
      res.render('index', {session:req.session, test: test});
    });





module.exports = router;

