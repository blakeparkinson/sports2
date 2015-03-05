var common = require('../routes/common')
var config = common.config();
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require("http"),
    async = require('async'),
    mongojs = require("mongojs"),

    db = mongojs.connect(config.mongo_uri);


var request = require('request');
var difference = require('array-difference');
var encryption = require('../encryption.js');


var players_model = require('../models/players.js');

//process.argv grabs the command line arguments
var league = process.argv[2];
var options = {};
options.only_insert = true;
var rosters = [];
var datenow = new Date();
var datecutoff = datenow.getTime() - config.dataAgeCutOff;

    //fetch the team collections
    db.collection('teams').find({'league': league}).toArray(function (err, teams) {
      //fetch the players collectiom
      db.collection('players').find().toArray(function (err, players){
        var common_team_ids = [];
        var all_team_ids = [];
        //loop through and filter out the players collections that we already have
        for (var i=0; i < teams.length; i++){
          all_team_ids.push(teams[i].team_id);
          for (var j=0; j < players.length; j++){
            var timestamp = new Date(players[j].last_updated.replace(' ', 'T')).getTime();
            if (teams[i].team_id == players[j].team_id){
              //see if their time in the db has been too loong and if so update them
              if (datecutoff < timestamp){
                common_team_ids.push(teams[i].team_id);
              }
            }
          }
        }
        var uncommon_team_ids = difference(common_team_ids, all_team_ids);
            
        //async is a helper library that helps keeping requests async
        async.eachSeries(uncommon_team_ids, function (id, callback) {
          //statistics endpoint
          request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+encryption.decrypt(id)+'/statistics.json?api_key=' + config.nba_key2, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              json_response = JSON.parse(body);
              //active roster endpoint
              request('https://api.sportsdatallc.org/nba-t3/teams/'+encryption.decrypt(id)+'/profile.json?api_key=' +config.nba_key, function (error, response, roster) {
                   if (!error && response.statusCode == 200) {
                   var team_roster = JSON.parse(roster);
                   var team_name = team_roster.market + ' ' + team_roster.name;
                   var players_roster = team_roster.players;
                   for (var i=0; i<json_response.players.length;i++){
                    for (var j=0; j<players_roster.length; j++){
                      //compare by player id, loop through and add the active tag
                      if (json_response.players[i].id == players_roster[j].id){
                        json_response.players[i].status = players_roster[j].status;
                        //we found a match, break out of the 2nd loop iteration
                        continue;
                      }
                    }
                  }
                  //do our sorting and what not in the model methods
                  players_sorted = players_model.sortNBA(json_response);
                  players = players_model.formatNBAPlayers(players_sorted, id, team_name);
                  rosters.push(players);
                  callback();
                }

              else{
                console.log('error:' + error + ' ,response: '+ response.statusCode);
                console.log('failed on active player fetching call');
                if (rosters.length){
                  //we failed somewhere and were likely rate limited, let's just insert what we got
                  mongoInsertLoop(league,rosters)

                }
              }
            });
          }
          else{
            console.log('error:' + error + ' ,response: '+ response.statusCode);
            console.log('failed on roster fetching call');
            if (rosters.length){
              //we failed somewhere and were likely rate limited, let's just insert what we got
              mongoInsertLoop(league,rosters)
            }
            else{
              console.log('we accomplished nothing');
            }
          }
        });
      },
      function done() {
        //somehow we didn't get rate limited!!!!
        mongoInsertLoop(league,rosters)
    });
  });
});

function mongoInsertLoop(league, rosters){
  console.log('we accomplished something');
  for (var b=0; b < rosters.length; b++){
    players_model.mongoInsertPlayers(rosters[b].team_id, league, rosters[b]);
  }

}


