var images_list = require('../lists/images2.js');
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
var shortId = require('shortid');
var salaries_list = require('../lists/other/nba/nba_salaries.js');


var returnPlayers = function (players, rb_team_id, res, league){
  if (res.quiz_page != undefined && res.quiz_page){
    var team_name = players.list_name    
     res.render('quiz', {
      roster: players.players,
      rb_team_id: rb_team_id,
      league: league,
      remove_footer: true,
      team_name: team_name,
      clock: getTimeLimit(league),
      background_image: randImg(league),
      logo_url: '../images/team_logos/'+league+'/'+players.name+'.png'
    });


  }
  else{
    res.json(players);   //this else statement poops out TypeError: Object nfl has no method 'json'
  }
}


var getTimeLimit = function(league){
  var clock = '0:00';
  switch (league){
    case 'nhl':
    case 'mlb':
    case 'eu_soccer':
    case 'nfl':
    case 'nba':
    case 'goats':
      clock = '5:00';
    break;
  }

  return clock;
}

/*var formatEvenOdds = function(players, is_starter){
  for (i=0; i<players.length; i++){
    if (is_starter){
      players[i].starter = true;
    }
    //special case if it's the last one and an odd number, it gets a row to itself
    if((players.length - i == 1) && (i % 2 == 0)) {
      players[i].render = '';
    }
    else if (i % 2 == 0){
      players[i].render = 'left';
    }
    else{
      players[i].render = 'right';
    }
  }
  return players;
}
*/


var fetchGoatPlayers = function(list_id, rb_team_id, league, res, req, callback){ 
  db.collection('goats').findOne({lid : list_id}, function (err, item){
    if (item != undefined){ // data in Mongo
        callback(item, rb_team_id, res, league)
      }
    else {
      console.log("goat list not in mongo");
    }
  });
}

// Check the db first. If it's there and has been added in the last 24 hours, use it. 
// Otherwise, go get new data from the API and replace/add the database listing
var fetchPlayers = function(team_id, rb_team_id, league, usat_id, res, req, callback){ 
  var players;
  db.collection('players').find({team_id : rb_team_id}).toArray(function (err, items){
    if (items.length > 0){ // data in Mongo
      //convert the date to unix timestamp
      var item = _.first(items);
      var itemdate = new Date(item.last_updated.replace(' ', 'T')).getTime();
      var datenow = new Date();
      var datecutoff = datenow.getTime() - dataAgeCutOff;
      if (datecutoff > itemdate){   //data is old so call API
         players = fetchPlayersFromApi(team_id, rb_team_id, league, usat_id, res, callback)
      }
      else {  // data is fine so just return it
        players = item;
        callback(players, rb_team_id, res, league);
      }
    }
    else {  // data not already in Mongo
       players = fetchPlayersFromApi(team_id, rb_team_id, league, usat_id, res, req, callback)
    }
  });
}


var fetchPlayersFromApi = function(team_id, rb_team_id, league, usat_id, res, req, callback){
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
            // find the image from usat and insert into players array
            for (a=0;a<Object.keys(json_response.players).length;a++){
              var player_name = json_response.players[a].first_name.toLowerCase()+'-'+json_response.players[a].last_name.toLowerCase()
              endpoint = 'http://www.gannett-cdn.com/media/SMG/sports_headshots/'+league+'/player/2014/'+usat_id+'/120x120/'+player_name+'.jpg';
              json_response.players[a].avatar_url = endpoint;
            } 
                
            //for nba we need to make a 2nd api request to fetch players on the active roster
            request('https://api.sportsdatallc.org/nba-t3/teams/'+encryption.decrypt(team_id)+'/profile.json?api_key=' +config.nba_key, function (error, response, roster) {
                  if (!error && response.statusCode == 200) {
                     var team_roster = JSON.parse(roster);
                     var players_roster = team_roster.players;
                     for (var i=0; i<json_response.players.length;i++){
                      for (var j=0; j<players_roster.length; j++){
                        //compare by player id
                        if (json_response.players[i].id == players_roster[j].id){
                          json_response.players[i].status = players_roster[j].status;
                          json_response.players[i].weight = players_roster[j].weight;
                          json_response.players[i].height = players_roster[j].height;
                          json_response.players[i].experience = players_roster[j].experience;
                          json_response.players[i].college = players_roster[j].college;
                          //we found a match, break out of the 2nd loop iteration
                          continue;
                        }
                      }
                     }
                     team_roster.usat_id = usat_id;
                     players_sorted = sortNBA(json_response);
                     players = formatNBAPlayers(players_sorted, rb_team_id, team_roster);
                     mongoInsertPlayers(league, players, rb_team_id);
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
            players = formatPlayers(players_sorted, rb_team_id, json_response);
            mongoInsertPlayers(league, players, rb_team_id);
            callback(players, rb_team_id, res, league)
            break;
          case 'nhl':
            json_response = JSON.parse(body);
            players = formatPlayers(json_response, rb_team_id, json_response);
            appendPlayerShortId(players.players);
            sortByPositions('nhl', players.players);
            mongoInsertPlayers(league, players, rb_team_id);
            callback(players, rb_team_id, res, league)
            break;
          case 'eu_soccer':
            playersParsed = formatEUSoccerPlayers(response.body, team_id);
            players = formatPlayersDocument(rb_team_id, playersParsed.players, playersParsed);
            mongoInsertPlayers(league, players, rb_team_id);
            callback(players, rb_team_id, res, league)
            break;
          case 'mlb':  
            playersParsed = formatMLBPlayers(response.body, team_id);
            players = formatPlayersDocument(rb_team_id, playersParsed);
            mongoInsertPlayers(league, players, rb_team_id);
            callback(players, rb_team_id, res, league)
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
      appendPlayerShortId(player);
      return player.status == 'ACT';
    })
  new_playersobject = players_object;
  for (i=0; i<new_playersarray.length; i++){

    sorted = actives.sort(compareNBA);
    new_playersobject.players = sorted;
    return new_playersobject;
  }
}

function appendPlayerShortId(player){
  //we can pass this method an array and it will generate playerids for each player
  if (player.length > 1){
    for (i=0; i < player.length; i++){
      player[i].player_id = shortId.generate();
    }
    return;
  }
  // it's just a single value
  return player.player_id = shortId.generate();
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

var formatNBAPlayers = function(response, rb_team_id, team_info){
  //var team = formatPlayersDocument(rb_team_id, response.players, team_info);
  var team = fetchSalaries(rb_team_id, response.players, team_info);
  return team;
}

/*var sortByPositions = function(league, starters){
    switch (league){
      case 'nba':
        var order = ['G', 'G-F', 'F-G', 'F', 'F-C', 'C-F', 'C'];
      break;

      case 'eu_soccer':
        var order = ['F', 'M', 'D', 'G'];
      break;

      case 'nhl':
        var order = ['F', 'D', 'G'];
      break;
      //figure out the other leagues later
      default:
        return;

    }
    starters.sort(function(a,b){
      return order.indexOf(a.position) - order.indexOf(b.position);
    });
}*/

// Fetch player salaries from nba_salary list and append to player object.
var fetchSalaries = function(response, rb_team_id, team_info){
  // use the team_info.usat_id to match to salaries_list.nba_salaries "TM" field.
  // Then, loop through players in response.players, matching on salaries.Player = players.full_name
  // (Performance check? Should this check every time, only if fields don't exist?)
  // Append players.salary and return response.players with this additional field
  // This should then call the formatPlayersDocument fxn with new response, rb_team_id, team_info
  
  // Loop through salaries list and find all listings of that team
  for (i=0;i<_.first(salaries_list).length; i++){
    team = _.first(salaries_list)[i];
    console.log("team"+team);
    console.log("team TM" + team.TM);

    Switch(team.TM){ // salaries_list abbreviations don't always match USAT abbreviations.
      case: "PHO" 
        team.TM = "PHX";
        break;
      case: "CHO" 
        team.TM = "CHA";
        break;
      case: "BRK" 
        team.TM = "BKN";
        break;
    } 
      
    if (team.TM.toLowerCase() == team_info.usat_id.toLowerCase()){
      // Once you find a team match, you need to find a player match
      player_name = team["Player"];
      player_salary = team["2015-16"];
      console.log("player_name from salaries "+ player_name);
      
      // need to figure out exactly what the player response looks like.. but likely:
      console.log("players response "+ response.players);
      for (j=0;j<response.players["Players"].length;j++){
        player_info = response.players["Players"][j];
        if (player_info.full_name.toLowerCase() == player_name.toLowerCase()){
          player_info.salary = player_salary;
          console.log(player_info.salary);
        }
      }
    }
  }
// Once we finished looping through everything, lets call the next function
  /* response.players = new_players
  var team = formatPlayersDocument(rb_team_id, response.players, team_info);
  return team;*/
}


var formatPlayers = function(response, rb_team_id, team_info){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){ 
      var value = response.players[i][key];
      playersarray[i][key] = value;
    }
  }
  var team = formatPlayersDocument(rb_team_id, playersarray, team_info);
  return team;
}


var formatPlayersDocument = function(rb_team_id, players, team_info){
  teamDocument = {};
  teamDocument.team_id = rb_team_id;
  teamDocument.players= players;
  teamDocument.market = team_info.market;
  teamDocument.name = team_info.name;
  teamDocument.team_name = team_info.market + ' ' + team_info.name;
  teamDocument.abbreviation = team_info.usat_id;
  return teamDocument;
}


function mongoInsertPlayers(league, team_document, rb_team_id){
  console.log("inserting into the DB");
  var team_id = '';
  if (rb_team_id != undefined){
    team_id = rb_team_id;
  }

  //the players_import script doesn't pass the rb_team_id but the document will have it
  else{
    team_id = team_document.rb_team_id;
  }
  db.open(function(err, db){
    db.collection("players").update({team_id: team_document.rb_team_id},
    {$set: {team_id: team_id, market: team_document.market, name: team_document.name, team_name: team_document.team_name, abbreviation: team_document.abbreviation, league: league, last_updated: new Date().toISOString().slice(0, 19).replace('T', ' '), players: team_document.players}},
    {upsert: true, multi:false}, function (err, upserted){
      if (err) {
        console.log('Ahh! An Error with Insert!');
        return;
      }
    });
  });
}


formatEUSoccerPlayers = function(response){
  var roster = {};
  parseString(response, function (err, result) {
    var str = result[Object.keys(result)[0]];
    roster.name = str.team[0].$.name;

      for (i=0; i < str.team.length;i++){
        for (j=0; j < str.team[i].roster.length; j++){
          for (k=0; k < str.team[i].roster[j].player.length; k++){
            var player = str.team[i].roster[j].player[k].$;
            appendPlayerShortId(player);
            players.push(player);
          }
        }
      }
  });
  sortByPositions('eu_soccer', players);
  roster.players = players
  return roster;
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

var randImg = function(league) {      
      var images = [];      
      switch (league) {
        case "mlb":
          var path = '../images/stadiums/mlb_stadiums/';          
        case "nfl":
          var path = '../images/stadiums/nfl_stadiums/';
            images[0] = "nfl-49ers-stadium.jpg",
            images[1] = "nfl-giants-stadium.jpg",
            images[2] = "nfl-patriots-stadium.jpg",
            images[3] = "nfl-ravens-stadium.jpg",
            images[4] = "nfl-seahawks-stadium.jpg",
            images[5] = "nfl-bills-stadium.jpg",
            images[6] = "nfl-chargers-stadium.jpg",
            images[7] = "nfl-chiefs-stadium.jpg",
            images[8] = "nfl-jets-stadium.jpg",
            images[9] = "nfl-raiders-stadium.jpg",
            images[10] = "nfl-cowboys-stadium.jpg"
          break;
        case "nhl":
          var path = '../images/stadiums/nhl_stadiums/';
            images[0] = "nhl-bruins-stadium.jpg",
            images[1] = "nhl-flyers-stadium.jpg",
            images[2] = "nhl-redwings-stadium.jpg",
            images[3] = "nhl-sabres-stadium.jpg",
            images[4] = "nhl-thrashers-stadium.jpg",
            images[5] = "nhl-predators-stadium.jpg"
          break;
        case "nba": 
          var path = '../images/stadiums/nba_stadiums/';          
            images[0] = "NBA-kings-stadium.jpg",
            images[1] = "NBA-bucks-stadium.jpg",
            images[2] = "NBA-warriors-stadium.jpg",
            images[3] = "NBA-pelicans-stadium.jpg",
            images[4] = "NBA-hornets-stadium.jpg",
            images[5] = "NBA-rockets-stadium.png",
            images[6] = "NBA-knicks-stadium.jpg",
            images[7] = "NBA-heat-stadium.jpg"
        break;          
        case "eu_soccer":
          var path = '../images/stadiums/euro_soccer_stadiums/';          
            images[0] = "olympiastadion-stadium.jpg",
            images[1] = "soccer-stadium4.jpg",
            images[2] = "bayernmunich-stadium.jpg",
            images[3] = "newcastle-stadium.jpg",
            images[4] = "saitama-stadium.jpg",
            images[5] = "sounders-stadium.jpg",
            images[6] = "fcbarcelona-stadium.jpg"                                                      
          break;
        default:
        var path = '../images/stadiums/nba_stadiums/';          
            images[0] = "NBA-kings-stadium.jpg",
            images[1] = "NBA-bucks-stadium.jpg",
            images[2] = "NBA-warriors-stadium.jpg",
            images[3] = "NBA-pelicans-stadium.jpg",
            images[4] = "NBA-hornets-stadium.jpg",
            images[5] = "NBA-rockets-stadium.jpg",
            images[6] = "NBA-knicks-stadium.jpg",
            images[7] = "NBA-heat-stadium.jpg"        
  
      }        
      var image = images[Math.floor(Math.random()*images.length)];
      image = path + image;
      return image;    
    }

module.exports = {
  returnPlayers: returnPlayers,
  fetchPlayersFromApi: fetchPlayersFromApi,
  fetchPlayers: fetchPlayers,
  fetchGoatPlayers: fetchGoatPlayers,
  formatPlayers: formatPlayers,
  formatNBAPlayers: formatNBAPlayers,
  formatPlayersDocument: formatPlayersDocument,
  mongoInsertPlayers: mongoInsertPlayers,
  sortNBA: sortNBA

}