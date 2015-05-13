// run this script by cd'ing into the scripts dir and 
//then typing "node index_script.js ['collection']"
// for example to import nba, you do "node index_script.js goats"

var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var encryption = require('../encryption.js');
var request = require('request');


var supported_collections = ['goats', 'teams', 'leaders', 'players', 'quiz'];

//process.argv grabs the command line arguments
var collection = process.argv[2];

if (supported_collections.indexOf(collection) == -1){
  console.log('We cant do this collection yet.');
  return
}


db.open(function(err, db){
    db.collection('teams').createIndex( { type: 1 }, { sparse: true }, function (err){
      if (err) {
        console.log('Ahh! An Error with Insert!');
        return;
      }
    })
  })

