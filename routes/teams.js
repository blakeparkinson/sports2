var common = require('./common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('underscore');
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
  id = req.query.team_id;   //this is the API id
  league = req.query.league;
  quiz = createQuiz(id, league, res, returnItem);
});

// made the return more universal for all callbacks
var returnItem = function (item, res){
  res.json(item);
}

var createQuiz = function(rb_team_id, league, res, callback){
  db.open(function(err, db){
    db.collection("quiz").insert({_id:shortId.generate(), team_id: rb_team_id, created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), league: league}, function (err, insert){
        if (err){
          console.log("new quiz insert failed");
        }
        else {
          callback(insert, res);
        }
    });
  });
}


//this is for the /teams page search field ajax
router.get('/team', function(req, res) {
    var term = req.query.q;
    console.log(term);
    //find the team, This syntax does a sql-type like clause with case insensitivity with the RegEx
    db.collection('teams').find({$or: [{'name': new RegExp(term, 'i')}, {'market': new RegExp(term, 'i')}]}).sort({'market': 1}).toArray(function (err, items) {
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

