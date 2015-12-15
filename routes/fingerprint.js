var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var redisClient = common.redisClient;


router.get('/', function(res, res) {
      res.render('fingerprint', {
      });
    });

router.get('/id', function(req, res) {
  var message;
  redisClient.get(req.query.id, function (err, hash) {
    if (hash != null){
      message = "We've seen you before!";
    }
    else{
      message = "You must be new here!";
      //store it

      redisClient.set(req.query.id, true);
    }
    res.json({id: req.query.id, message: message, success: true});




});

});

module.exports = router;
