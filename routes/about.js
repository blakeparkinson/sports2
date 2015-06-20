var express = require('express');
var router = express.Router();
var http = require("http");
    

router.get('/', function(res, res) {
      res.render('about', {title: "RosterBlitz - Put Your Sports Knowledge to the Ultimate Test"
    	});
    });

module.exports = router;
