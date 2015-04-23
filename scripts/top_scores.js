var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var images = require('../lists/images2.js');
var _ = require('lodash');
var common = require('../routes/common')
var config = common.config();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var players_model = require('../models/players.js');


    
    url = 'http://www.cbssports.com/nba/stats/playersort/nba/year-2014-season-regularseason-category-scoringpergame';
    request(url, function(error, response, html){

        if(!error){
            var $ = cheerio.load(html);

           	//this is the table class name
            $('.data').filter(function(){

           // Let's store the data we filter into a variable so we can easily see what's going on.


                var data = $(this);
                var results = [];
                //sort through their odd and even rows
                var tr = data.find('.row1, .row2')
                tr.each(function(i, element){
                  var player = $(this).find('td:first-child').text();
                  var team = $(this).find('td:nth-child(3)').text();
                  var ppg = $(this).find('td.sort').text();
                  var metadata = {
                    name: player,
                    ppg: ppg,
                    team: abbreviation_helper(team)  // Consolidates abbreviation differences between sites
                  };
                  results.push(metadata);
                })
                _.forEach(results, function(n, key) {
                  players_model.pluckPlayerFromName(n.team, n.name);

                })

            })
        }
        else{
          console.log(error);
        }
    })


var abbreviation_helper = function(abbreviation){
  var replace = abbreviation
  switch (abbreviation){
    case 'GS': 
      replace = 'GSW'
      break;
    case 'NO': 
      replace = 'NOP'
      break;
    case 'NY': 
      replace = 'NYK'
      break;
    case 'SA': 
      replace = 'SAS'
      break;
    case 'PHO': 
      replace = 'PHX'
      break;
  }
  return replace
}

