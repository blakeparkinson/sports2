var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz',

    db = mongojs.connect(uri, ["teams"]),
    db_players = mongojs.connect(uri, ["players"]);


var request = require('request');
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';
var nfl_key = 'b4cwkbyqfyq25fcruevj5hw2';
var ncaa_fb_key = 'rajn798e9qe8a4av49h95qju';
var mlb_key = 'wxf8qgjxs7ka6ay8ec249etg';
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy',
  teams = [];


// PLAYERS ============================================================= //

 // step one. we look for players in mongo
db_players.open(function(err,db_players){
    db_players.collection('players',function(err,collection){
      collection.find().toArray(function(err, players) {
        if (err || players.length ==0){
          //mongo is empty, call api and let api handle render
          fetchPlayersFromApi();
        }
        else{
          //just render
          renderPlayers(players);
        }
      })
    }) //collection
  }); //open

  var fetchPlayersFromApi = function(){
    var team = "583ec825-fb46-11e1-82cb-f4ce4684ea4c";

    request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team+'/statistics.json?api_key='+nba_key, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json_response = (JSON.parse(response.body));
            players = formatPlayers(json_response);
        renderPlayers(players);
        mongoInsertPlayers(players);
      }
      else{
        console.log('no bueno');
      }
    });

  }

  var renderPlayers = function(players){
    
    // don't render the page until we have formatted our teams
    router.get('/', function(res, res) {
      res.render('index', {
      teams: players,
      });
    });
  }


function mongoInsertPlayers(players){
  db_players.open(function(err, client){
    client.collection("players", function(err, col) {
      for (var i = 0; i < players.length; i++) {
        //really the only 3 key:value pairs we care about for now
        col.insert({id:players[i].id, full_name:players[i].full_name, last_name:players[i].last_name}, function() {});
      }
    })
  });

}


var formatPlayers = function(response){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){
      if (key != "total" && key != "average"){
        var value = response.players[i][key];
        playersarray[i][key] = value;
      }
      else if (key =="total"){
        for(var key in response.players[i].total) {
          var value = response.players[i].total[key];
          playersarray[i]["total_"+key] = value;
        }
      }
      else {
        for(var key in response.players[i].average) {
          var value = response.players[i].average[key];
          playersarray[i]["average_"+key] = value;
        }
      }
    }
  }
  return playersarray;
}



// TEAM ============================================================= //

// step one. we look in mongo
db.open(function(err,db){
    db.collection('teams',function(err,collection){
      collection.find().toArray(function(err, teams) {
        if (err || teams.length ==0){
          //mongo is empty, call api and let api handle render
          fetchFromApi();
        }
        else{
          //just render
          renderTeams(teams);
        }
      })
    }) //collection
  }); //open



  var fetchFromApi = function(){

    request('https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + nba_key, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json_response = (JSON.parse(response.body));
            teams = formatTeams(json_response);
        renderTeams(teams);
        mongoInsert(teams);
      }
      else{
        console.log('somethings really terrible happened');
      }
    });

  }

  var renderTeams = function(nba_teams){
    
    nba_teams.sort(compare);
    // don't render the page until we have formatted our teams
    router.get('/', function(res, res) {
      res.render('index', {
      teams: nba_teams,
      });
    });
  }

  

function compare(a,b) {
  if (a.market < b.market)
     return -1;
  if (a.market > b.market)
    return 1;
  return 0;
}

//inserts the record into mongo. 
//Plan is to fetch the team id from mongo and only 
//hit api as fallback and then update mongo
function mongoInsert(teams){
  db.open(function(err, client){
    client.collection("teams", function(err, col) {
      for (var i = 0; i < teams.length; i++) {
        //really the only 3 key:value pairs we care about for now
        col.insert({id:teams[i].id, name:teams[i].name, market:teams[i].market}, function() {});
      }
    })
  });

}


var formatTeams = function(hierarchy_response){
  for (i=0;i<hierarchy_response.conferences.length;i++){
    for (j=0;j<hierarchy_response.conferences[i].divisions.length;j++){
      for(k=0; k< hierarchy_response.conferences[i].divisions[j].teams.length; k++){
            teams.push(hierarchy_response.conferences[i].divisions[j].teams[k]);
      }
    }   
  }
return teams
}



module.exports = router;

