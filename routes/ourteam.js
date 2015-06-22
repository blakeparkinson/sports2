var express = require('express');
var router = express.Router();
var http = require("http");
var common = require('./common')
var config = common.config();
    

router.get('/', function(res, res) {
      res.render('ourteam', {
      	footer_class: 'static',
      });
    });

module.exports = router;
