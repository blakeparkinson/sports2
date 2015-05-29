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
var teams_model = require('../models/teams.js');
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
  var team_id = req.query.team_id;
  var league = req.query.league;
  var type = req.query.type;
  if (req.query.trending){
    db.collection('teams').findOne( { team_id : team_id}, function (err, item){
      if (item != null){
        var league = item.league;
        if (players_model.goatsLeadersArray().indexOf(type) > -1){
          var api_team_id = null;
          var quiz_name = item.category;
        }
        else{
          var api_team_id = item.api_team_id;
          var quiz_name = item.market + ' ' + item.name;
        }
        teams_model.createQuiz(team_id, league, quiz_name, res, returnItem, api_team_id, type);
      }
      else{
        res.status(500);
        res.json('error', { error: 'unable to find a matching team' });
      }
    });
    
  }
  else if (players_model.goatsLeadersArray().indexOf(type) > -1){ // leaders or goats
    db.collection('teams').findOne( {team_id: team_id}, function (err, item){
      if (item != null){
        var quiz_name = item.category;
        var api_team_id = null;
        teams_model.createQuiz(team_id, league, quiz_name, res, returnItem, api_team_id, type);
      }

    })
  }
  else{
    var quiz_name = req.query.team_name;
    var league = req.query.league;
    var api_team_id = req.query.api_team_id;
    teams_model.createQuiz(team_id, league, quiz_name, res, returnItem, api_team_id, type);
  }
});

// made the return more universal for all callbacks
var returnItem = function (item, res){
  res.json(item);
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

