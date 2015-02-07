var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http");
		mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri, ["teams"]);
    

router.get('/', function(req, res) {
			quiz_id = req.query.quiz_id;
			console.log(quiz_id);
      res.render('quiz', {
      });
    });

module.exports = router;
