var express = require('express');
var router = express.Router();
var http = require("http");
    

router.get('/', function(req, res) {
      res.render('leaguesearch');
    });

router.get('/:league', function(req, res) {
		var league = req.params.league;
      res.render('leaguesearch', {
      	league: league
      });
    });

module.exports = router;
