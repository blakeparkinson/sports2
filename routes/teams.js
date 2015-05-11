var common = require('./common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var players_model = require('../models/players.js');
var shortId = require('shortid');
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.rosterblitz_gmail_un,
        pass: config.rosterblitz_gmail_pw
    }
});


router.get('/', function(res, res) {
      res.render('teams', {
      });
    });


// when quiz endpoint is hit, insert a new quiz into mongo and return quiz_id
router.get('/quiz', function(req, res) {
  var rb_team_id = req.query.rb_team_id;
  var league = req.query.league;
  var type = req.query.type;

  if (req.query.trending){
    if (type){ // leaders or goats
      db.collection('teams').findOne( { _id : rb_team_id}, function (err, item){
        if (item != null){
          var league = item.league;
          var api_team_id = null;
          var quiz_name = item.category;
          createQuiz(rb_team_id, league, quiz_name, res, returnItem, api_team_id, type);
        }
        else{
          res.status(500);
          res.json('error', { error: 'unable to find a matching team' });
        }
      });
    }
    else{
      db.collection('teams').findOne( { _id : rb_team_id}, function (err, item){
        if (item != null){
          var league = item.league;
          var api_team_id = item.team_id;
          var quiz_name = item.market + ' ' + item.name;
          createQuiz(rb_team_id, league, quiz_name, res, returnItem, api_team_id, type);
        }
        else{
          res.status(500);
          res.json('error', { error: 'unable to find a matching team' });
        }
      });
    }
  }
  else if (type){ // leaders or goats
    db.collection('teams').findOne( {_id: rb_team_id}, function (err, item){
      if (item != null){
        var quiz_name = item.category;
        var api_team_id = null;
        createQuiz(rb_team_id, league, quiz_name, res, returnItem, api_team_id, type);
      }

    })
  }
  else{
    var quiz_name = req.query.team_name;
    var league = req.query.league;
    var api_team_id = req.query.api_team_id;
    createQuiz(rb_team_id, league, quiz_name, res, returnItem, api_team_id, type);
  }
});

// made the return more universal for all callbacks
var returnItem = function (item, res){
  res.json(item);
}

var createQuiz = function(rb_team_id, league, quiz_name, res, callback, api_team_id, type){
  db.open(function(err, db){
    db.collection("quiz").insert({_id:shortId.generate(), rb_team_id: rb_team_id, type:type, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), league: league, api_team_id: api_team_id, quiz_name: quiz_name, quiz_score: "null"}, function (err, insert){
        if (err){
          console.log("new quiz insert failed: "+ err);
        }
        else {
          callback(insert[0], res);
        }
    });
  });
}


//this is for the /teams page search field ajax
router.get('/team', function(req, res) {
    var term = req.query.q;
    //find the team, This syntax does a sql-type like clause with case insensitivity with the RegEx
    db.collection('teams').find({$or: [{'name': new RegExp(term, 'i')}, {'market': new RegExp(term, 'i')}, {'category': new RegExp(term, 'i')}, {'keywords': new RegExp(term, 'i')}]}).sort({'market': 1}).toArray(function (err, items) {
      res.json(items);
    });
});


router.get('/email', function(req,res){

    var mailOptions = {

        from: req.query.sender, // sender address 
        to: req.query.recipients, // list of receivers 
        subject: req.query.subject, // Subject line 
        text: req.query.text_body, // plaintext body 
        html: req.query.html_body// html body 
    };

    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
})
  

module.exports = router;

