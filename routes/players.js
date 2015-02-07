
var express = require('express');
var router = express.Router();
var http = require("http");
module.exports ={
	
	returnPlayers : function (players, res){
    res.json(players);
	}
}

module.exports = router;
