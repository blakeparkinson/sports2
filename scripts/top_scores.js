var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
    
    url = 'http://www.cbssports.com/nba/stats/playersort/nba/year-2014-season-regularseason-category-scoringpergame';
    request(url, function(error, response, html){

        if(!error){
            var $ = cheerio.load(html);


            $('.data').filter(function(){

           // Let's store the data we filter into a variable so we can easily see what's going on.
                 

                var data = $(this);
                var results = [];
                var tr = data.find('.row1, .row2')
                tr.each(function(i, element){
                  var player = $(this).find('td:first-child').text();
                  var ppg = $(this).find('td.sort').text();
                  var metadata = {
                    name: player,
                    ppg: ppg,
                  };
                  results.push(metadata);
                })
                console.log(results);

            })
        }
        else{
          conole.log(error);
        }
    })
