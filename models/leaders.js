var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(common.mongo_uri);
var endpoint = '';
var encryption = require('../encryption.js');
var shortId = require('shortid');

var fetchLeadersLists = function(type, league, callback, team_id){
  var data = {};
  if (team_id){
    db.collection(type).findOne({team_id: team_id},function (err, doc){
      callback(doc);
    });
  }
  else{
  
    if (league){
      //do filtering
      data.league = league
    }
    db.collection(type).find(data).toArray(function (err, items){
      callback(null, items);
    });
  }
}


module.exports = {
  fetchLeadersLists: fetchLeadersLists
}