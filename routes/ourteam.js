var express = require('express');
var router = express.Router();
var http = require("http");
    

router.get('/', function(res, res) {
      res.render('ourteam', {
      	static_footer: true
      });
    });

module.exports = router;
