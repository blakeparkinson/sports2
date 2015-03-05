var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);
var dataAgeCutOff = 604800000;  //This is 1 week in milliseconds
var teams = [];
var endpoint = '';
var parseString = require('xml2js').parseString;
var players = [];
var encryption = require('../encryption.js');

var returnPlayers = function (players, rb_team_id, res, league){
  if (res.quiz_page != undefined && res.quiz_page){
    res.render('quiz', {
      players: players.players,
      rb_team_id: rb_team_id,
      league: league,
      static_footer: true,
      team_name: players.team_name
    });

  }
  else{
    res.json(players);   //this else statement poops out TypeError: Object nfl has no method 'json'
  }
}

// Check the db first. If it's there and has been added in the last 24 hours, use it. 
// Otherwise, go get new data from the API and replace/add the database listing
var fetchPlayers = function(team_id, rb_team_id, league, res, req, callback){ 
  var players;
  db.collection('players').find({team_id : rb_team_id}).toArray(function (err, items){
    if (items.length > 0){ // data in Mongo
      //convert the date to unix timestamp
      var item = _.first(items);
      var itemdate = new Date(item.last_updated.replace(' ', 'T')).getTime();
      var datenow = new Date();
      var datecutoff = datenow.getTime() - dataAgeCutOff;
      if (datecutoff > itemdate){   //data is old so call API
         players = fetchPlayersFromApi(team_id, rb_team_id, league, res, callback)
      }
      else {  // data is fine so just return it
        players = item;
        callback(players, rb_team_id, res, league);
      }
    }
    else {  // data not already in Mongo
       players = fetchPlayersFromApi(team_id, rb_team_id, league, res, req, callback)
    }
  });
}


var fetchPlayersFromApi = function(team_id, rb_team_id, league, res, req, callback){
var json_response = '';
var players = {};

switch (league){
  case 'nba':
    endpoint = 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+encryption.decrypt(team_id)+'/statistics.json?api_key=' + config.nba_key2;
    break;
  case 'nfl':
    endpoint = 'https://api.sportsdatallc.org/nfl-t1/teams/'+encryption.decrypt(team_id)+'/2014/REG/statistics.json?api_key='+ config.nfl_key;
    break;
  case 'nhl':
    endpoint = 'https://api.sportsdatallc.org/nhl-t3/seasontd/2014/REG/teams/'+encryption.decrypt(team_id)+'/statistics.json?api_key='+ config.nhl_key;
    break;
  case 'eu_soccer':
    endpoint = 'https://api.sportsdatallc.org/soccer-t2/eu/teams/'+encryption.decrypt(team_id)+'/profile.xml?api_key='+config.soccer_eu_key;
    break;
  case 'mlb':
    endpoint = 'https://api.sportsdatallc.org/mlb-t4/rosters/2014.xml?api_key='+config.mlb_key;
}

    request(endpoint, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        switch (league){
          case 'nba':
            json_response = JSON.parse(body);
            //for nba we need to make a 2nd api request to fetch players on the active roster
            request('https://api.sportsdatallc.org/nba-t3/teams/'+encryption.decrypt(team_id)+'/profile.json?api_key=' +config.nba_key, function (error, response, roster) {
                  if (!error && response.statusCode == 200) {
                     var team_roster = JSON.parse(roster);
                     var players_roster = team_roster.players;
                     var team_name = team_roster.market + ' ' + team_roster.name;
                     for (var i=0; i<json_response.players.length;i++){
                      for (var j=0; j<players_roster.length; j++){
                        //compare by player id
                        if (json_response.players[i].id == players_roster[j].id){
                          json_response.players[i].status = players_roster[j].status;
                          //we found a match, break out of the 2nd loop iteration
                          continue;
                        }
                      }
                     } 
                     players_sorted = sortNBA(json_response);
                     players = formatNBAPlayers(players_sorted, rb_team_id, team_name);
                     mongoInsertPlayers(rb_team_id, league, players);
                     callback(players, rb_team_id, res, league)
                  }

                  else{
                    console.log(error + ' api_status_code:' + response.statusCode);
                  }
            }) 
            break; 
          case 'nfl':
            json_response = JSON.parse(body);
            players_sorted = sortNFL(json_response);
            players = formatPlayers(players_sorted, rb_team_id);
            mongoInsertPlayers(rb_team_id, league, players);
            callback(players.players, rb_team_id, res, league)
            break;
          case 'nhl':
            json_response = JSON.parse(body);
            players = formatPlayers(json_response, rb_team_id);
            mongoInsertPlayers(rb_team_id, league, players);
            callback(players.players, rb_team_id, res, league)
            break;
          case 'eu_soccer':
            playersParsed = formatEUSoccerPlayers(response.body, team_id);
            players = formatPlayersDocument(rb_team_id, playersParsed);
            mongoInsertPlayers(rb_team_id, league, players);
            callback(players.players, rb_team_id, res, league)
            break;
          case 'mlb':  
            playersParsed = formatMLBPlayers(response.body, team_id);
            players = formatPlayersDocument(rb_team_id, playersParsed);
            mongoInsertPlayers(rb_team_id, league, players);
            callback(players.players, rb_team_id, res, league)
            break;
        }

    }
      else{
        console.log('something really terrible has happened');
      }
    });
}


var sortNBA = function(players_object){
  new_playersarray = players_object.players;
  //only return active players to the client
    var actives = _.filter(new_playersarray, function(player){
      return player.status == 'ACT';
    })
  new_playersobject = players_object;
  for (i=0; i<new_playersarray.length; i++){
    sorted = actives.sort(compareNBA);
    new_playersobject.players = sorted;
    return new_playersobject;
  }
}

function compareNBA(a,b) {
  if (a.total.games_started < b.total.games_started)
     return 1;
  if (a.total.games_started > b.total.games_started)
    return -1;
  return 0;
}


var sortNFL = function(players_object){
  new_playersarray = players_object.players;
  new_playersobject = players_object;
  for (i=0; i<new_playersarray.length; i++){
    sorted = new_playersarray.sort(compareNFL);
    new_playersobject.players = sorted;
    return new_playersobject;
  }
}

function compareNFL(a,b) {
  if (a.games_started < b.games_started)
     return 1;
  if (a.games_started > b.games_started)
    return -1;
  return 0;
}


var formatNBAPlayers = function(response, rb_team_id, team_name){
  var startersarray = response.players.slice(0,5);
  var bencharray = response.players.slice(5,response.players.length);
  var players = [];
  players.push({starters: startersarray});
  players.push({bench: bencharray});
  var team = formatPlayersDocument(rb_team_id, players, team_name);
  return team;
}

var formatPlayers = function(response, rb_team_id){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){   //all
      var value = response.players[i][key];
      playersarray[i][key] = value;
    }
  }
  var team = formatPlayersDocument(rb_team_id, playersarray);
  return team;
}


var formatPlayersDocument = function(rb_team_id, players, team_name){
  teamDocument = {};
  teamDocument["team_id"] = rb_team_id;
  teamDocument["players"] = players;
  teamDocument["team_name"] = team_name;
  return teamDocument;
}


function mongoInsertPlayers(rb_team_id, league, team_document){
  console.log("inserting into the DB");
  db.open(function(err, db){
    db.collection("players").update({team_id: rb_team_id},
    {$set: {team_id: team_document["team_id"], team_name: team_document["team_name"], league: league, last_updated: new Date().toISOString().slice(0, 19).replace('T', ' '), players: team_document["players"]}},
    {upsert: true, multi:false}, function (err, upserted){
      if (err) {
        console.log('Ahh! An Error with Insert!');
        return;
      }
    });
  });
}


formatEUSoccerPlayers = function(response){
  parseString(response, function (err, result) {
    var str = result[Object.keys(result)[0]];
      for (i=0; i < str.team.length;i++){
        for (j=0; j < str.team[i].roster.length; j++){
          for (k=0; k < str.team[i].roster[j].player.length; k++){
            players.push(str.team[i].roster[j].player[k].$);
          }
        }
      }
  });
  return players;
}

formatMLBPlayers = function(response, team_id){
  parseString(response, function (err, result) {
    var str = result[Object.keys(result)[0]];
        for (j=0; j < str.team.length; j++){ 
          if (str.team[j].$.id.trim() == encryption.decrypt(team_id).trim()){
            for (k=0; k < str.team[j].players[0].player.length; k++){
              players.push(str.team[j].players[0].player[k].$)
            }
          }
        }
  });
  return players;
}


module.exports = {
  returnPlayers: returnPlayers,
  fetchPlayersFromApi: fetchPlayersFromApi,
  fetchPlayers: fetchPlayers,
  formatPlayers: formatPlayers,
  formatNBAPlayers: formatNBAPlayers,
  formatPlayersDocument: formatPlayersDocument,
  mongoInsertPlayers: mongoInsertPlayers,
  sortNBA: sortNBA

}