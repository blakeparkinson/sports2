var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var shortId = require('shortid');

//helper for deleting teams
var deleteTeam = function(data){
  db.open(function(err, db){
    db.collection('teams',{},function(err, collection){
      collection.remove(data,function(err, removed){
        console.log(removed);
      });
    });
  });
}

module.exports = {
  deleteTeam: deleteTeam
}