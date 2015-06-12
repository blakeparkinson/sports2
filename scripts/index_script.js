// run this script by cd'ing into the scripts dir and 
// uncommenting the indexes you want to insert into Mongo
// Type "node index_script.js to run


var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(common.mongo_uri);
var encryption = require('../encryption.js');
var request = require('request');


/*
// Players Collection Team_id unique
db.open(function(err, db){
    db.collection('players').createIndex( { team_id: 1 }, { unique: true }, function (err){
      if (err) {
        console.log('Ahh! An Error with Insert!');
        return;
      }
    })
  })

*/

/*
// Quiz Collection Type & League
db.open(function(err, db){
    db.collection('quiz').createIndex( { type: "text", league: "text" }, function (err){
      if (err) {
        console.log('Ahh! An Error with Insert!');
        return;
      }
    })
  })

*/

/*
// Quiz Collection 
db.open(function(err, db){
    db.collection('quiz').createIndex( { created_at : 1}, function (err){
      if (err) {
        console.log('Ahh! An Error with Insert!');
        return;
      }
    })
  })
*/

