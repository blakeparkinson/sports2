var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http");
		mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri, ["teams"]);
var players_model = require('../models/players.js');
    

router.get('/', function(req, res) {
			res.quiz_page = true;
			quiz_id = req.query.quiz_id;
			team_id = req.query.team_id;
			league = req.query.league;
			players = players_model.fetchPlayers(team_id, league, res, players_model.returnPlayers);

  });

module.exports = router;
