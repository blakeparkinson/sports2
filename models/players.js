var images_list = require('../lists/images2.js');
var common = require('../routes/common')
var config = common.config();
var express = require('express');
var request = require('request');
var router = express.Router();
var _ = require('lodash');
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(common.mongo_uri);
var dataAgeCutOff = 604800000;  //This is 1 week in milliseconds
var teams = [];
var endpoint = '';
var parseString = require('xml2js').parseString;
var players = [];
var encryption = require('../encryption.js');
var shortId = require('shortid');
var top_category = [];
var salaries_list = require('../lists/other/nba/nba_salaries.js');
var teamColors = require('../lists/team_colors/team_colors.js');
var teams_model = require('./teams.js');
var avatarLeagues = ['nfl, nhl'];
var util = require('util');
var redisClient = common.redisClient;


var goatsLeadersArray = function(){

  var a =['goats', 'leaders'];
  return a;
}

var intreturnPlayers = function(players, team_id, res, req, league, second_callback){
  var colors = fetchTeamColors(league, players.name);
  second_callback(players, team_id, res, req, league, colors)
}


var returnPlayers = function (players, team_id, res, req, league, colors){
  if (res.quiz_page != undefined && res.quiz_page){
    var team_name = players.team_name
    var primary_hex = colors.primary_hex;
    var secondary_hex = colors.secondary_hex;
     res.render('quiz', {
      roster: players.players,
      primary_hex: primary_hex,
      secondary_hex: secondary_hex,
      team_id: team_id,
      league: league,
      remove_footer: true,
      team_name: team_name,
      clock: getTimeLimit(league),
      background_image: randImg(league, players.name),
      logo_url: '../images/team_logos/'+league+'/'+players.name.replace(/ +/g, "").toLowerCase()+'.png',
      quizPage: true,
      isMobile: common.isMobile(req),
      view: 'quiz',
      title: "RosterBlitz - Sports Trivia and Quizzes"
    });


  }
  else{
    res.json(players);   //this else statement poops out TypeError: Object nfl has no method 'json'
  }
}

var fetchTeamColors = function (league, team_name){
  var colors = [];
  colors.primary_hex = "#333333";
  colors.secondary_hex = "#FFFFFF";
  _.each(teamColors.team_colors, function(leagueObj){
    if (leagueObj.league == league){
      _.each(leagueObj.teams, function(teamObj){
        if (teamObj.name == team_name){
          colors.primary_hex = teamObj.primary_hex;
          colors.secondary_hex = teamObj.secondary_hex;
        }
      })
    }
  })
  return colors;
}


var getTimeLimit = function(league){
  var clock = '0:00';
  switch (league){
    case 'nhl':
    case 'mlb':
    case 'eu_soccer':
    case 'nfl':
    case 'nba':
      clock = '2:00';
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

// Check redis first. Not there go to Mongo
// Check the db. If it's there and has been added in the last 24 hours, use it.
// Otherwise, go get new data from the API and replace/add the database listing
var fetchPlayers = function(type, api_team_id, team_id, league, usat_id, res, req, first_callback, second_callback){
  var players;
  redisClient.get(team_id, function (err, playersString) {
    if (playersString != null && !isItemExpired(JSON.parse(playersString))){
        //we got something in redis, continue
        first_callback(JSON.parse(playersString), team_id, res, req, league, second_callback);
      }
    else{
      if (playersString != null && isItemExpired(JSON.parse(playersString))){
        //clear redis
        redisClient.set(team_id, null);
      }
    // not in redis, go to mongo
      if (goatsLeadersArray().indexOf(type) > -1){
        //it's a leader or goat quiz
        db.collection(type).find({team_id : team_id}).toArray(function (err, items){
          players = items;
          redisClient.set(team_id, JSON.stringify(players));
          first_callback(players, team_id, res, req, league, second_callback);
        })
      }
      else {
        // it's a roster quiz
        db.collection('players').find({team_id : team_id}).toArray(function (err, items){
          if (items.length > 0){ // data in Mongo
            var item = _.first(items);
            if (isItemExpired(item)){   //data is old so call API
               players = fetchPlayersFromApi(api_team_id, team_id, league, usat_id, res, req, first_callback, second_callback)
            }
            else {  // data is fine so just return it
              players = item;
              redisClient.set(team_id, JSON.stringify(players));
              first_callback(players, team_id, res, req, league, second_callback);
            }
          }
          else {  // data not already in Mongo
             players = fetchPlayersFromApi(api_team_id, team_id, league, usat_id, res, req, first_callback, second_callback)
          }
        });
      }
    }

  })
}

var isItemExpired = function (item){
  var itemdate = new Date(item.last_updated.replace(' ', 'T')).getTime();
  var datenow = new Date();
  var datecutoff = datenow.getTime() - dataAgeCutOff;
  if (datecutoff > itemdate){
    return true;
  }
  else{
    return false;
  }

}


var fetchPlayersFromApi = function(api_team_id, team_id, league, usat_id, res, req, first_callback, second_callback){
var json_response = '';
var players = {};

switch (league){
  case 'nba':
    endpoint = 'https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+encryption.decrypt(api_team_id)+'/statistics.json?api_key=' + config.nba_key2;
    break;
  case 'nfl':
    endpoint = 'https://api.sportsdatallc.org/nfl-t1/teams/'+encryption.decrypt(api_team_id)+'/2014/REG/statistics.json?api_key='+ config.nfl_key;
    break;
  case 'nhl':
    endpoint = 'https://api.sportsdatallc.org/nhl-t3/seasontd/2014/REG/teams/'+encryption.decrypt(api_team_id)+'/statistics.json?api_key='+ config.nhl_key;
    break;
  case 'eu_soccer':
    endpoint = 'https://api.sportsdatallc.org/soccer-t2/eu/teams/'+encryption.decrypt(api_team_id)+'/profile.xml?api_key='+config.soccer_eu_key;
    break;
  case 'mlb':
    endpoint = 'https://api.sportsdatallc.org/mlb-t5/league/active_rosters.json?api_key='+config.mlb_key;
}

    request(endpoint, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        switch (league){
          case 'nba':
            json_response = JSON.parse(body);
            // find the image from usat and insert into players array
            appendAvatarUrl(json_response);

            //for nba we need to make a 2nd api request to fetch players on the active roster
            request('https://api.sportsdatallc.org/nba-t3/teams/'+encryption.decrypt(api_team_id)+'/profile.json?api_key=' +config.nba_key, function (error, response, roster) {
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
                     players = formatNBAPlayers(players_sorted, team_id, team_roster);
                     mongoInsertPlayers(league, players, team_id);
                     first_callback(players, team_id, res, req, league, second_callback)
                  }

                  else{
                    console.log(error + ' api_status_code:' + response.statusCode);
                  }
            })
            break;
          case 'nfl':
            json_response = JSON.parse(body);
            json_response.usat_id = abbreviationHelper(league, usat_id);
            players = formatPlayers(json_response, team_id, json_response, league);
            appendPlayerShortId(players.players);
            mongoInsertPlayers(league, players, team_id);
            first_callback(players, team_id, res, req, league,second_callback)
            break;
          case 'nhl':
            json_response = JSON.parse(body);
            json_response.usat_id = abbreviationHelper(league, usat_id);
            appendAvatarUrl(json_response);
            players = formatPlayers(json_response, team_id, json_response, league);
            appendPlayerShortId(players.players);
            mongoInsertPlayers(league, players, team_id);
            first_callback(players, team_id, res, req, league, second_callback)
            break;
          case 'eu_soccer':
            playersParsed = formatEUSoccerPlayers(response.body, usat_id);
            players = formatPlayersDocument(team_id, playersParsed.players, playersParsed);
            mongoInsertPlayers(league, players, team_id);
            first_callback(players, team_id, res, req, league, second_callback)
            break;
          case 'mlb':
            json_response = JSON.parse(body);
            players = formatMLBPlayers(json_response, team_id, api_team_id, usat_id);
            appendPlayerShortId(players.players);
            mongoInsertPlayers(league, players, team_id);
            first_callback(players, team_id, res, req, league,second_callback)
            break;
        }

    }
      else{
        console.log('something really terrible has happened');
      }
    });
}

var appendAvatarUrl = function(playersObj){
  for (a=0;a<Object.keys(playersObj.players).length;a++){
    var player_name = playersObj.players[a].first_name.toLowerCase()+'-'+playersObj.players[a].last_name.toLowerCase()
    endpoint = '../images/headshots/'+league+'/'+player_name+'.jpg';
    playersObj.players[a].avatar_url = endpoint;
  }
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

var formatNBAPlayers = function(response, team_id, team_info){
  var team = fetchSalaries(response.players, team_id, team_info);
  return team;
}

// Fetch player salaries from nba_salary list and append to player object.
var fetchSalaries = function(response, team_id, team_info){
  // Loop through salaries list and find all listings of that team
  for (i=0;i<salaries_list.salaries.length; i++){
    team = salaries_list.salaries[i];
    switch(team.Tm){ // salaries_list abbreviations don't always match USAT abbreviations.
      case "PHO":
        team.Tm = "PHX";
        break;
      case "CHO":
        team.Tm = "CHA";
        break;
      case "BRK":
        team.Tm = "BKN";
        break;
    }

    if (team.Tm.toLowerCase() == team_info.usat_id.toLowerCase()){
      // Once you find a team match, you need to find a player match
      player_name = team["Player"];
      player_salary = team["2015-16"];
      for (j=0;j<response.length;j++){
        if (response[j].full_name.toLowerCase() == player_name.toLowerCase()){
          response[j].salary = player_salary;
        }
      }
    }
  }
  var team = formatPlayersDocument(team_id, response, team_info);
  return team;
}


var formatPlayers = function(response, team_id, team_info, league){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    if (league == 'nfl'){
      //nfl only returns 'name' do some magic to create full_name and last_name and delete the name field
      response.players[i].full_name = response.players[i].name;
      var namePieces = response.players[i].name.split(' ');
      response.players[i].last_name = namePieces[1];
      delete response.players[i].name;
    }
    playersarray[i] = {};
    //check to see if the league is one where we do headshots
    if (avatarLeagues.indexOf(league) > -1){
      response.players[i].avatar_url = '../images/headshots/'+league+'/'+response.players[i].full_name.replace(/\s+/g, '-').toLowerCase()+'.jpg';
    }
    for(var key in response.players[i]){
      var value = response.players[i][key];
      playersarray[i][key] = value;
    }
  }
  var team = formatPlayersDocument(team_id, playersarray, team_info);
  return team;
}


var formatPlayersDocument = function(team_id, players, team_info){
  teamDocument = {};
  teamDocument.team_id = team_id;
  teamDocument.players= players;
  teamDocument.market = team_info.market;
  teamDocument.name = team_info.name;
  teamDocument.team_name = (typeof team_info.market === 'undefined')? team_info.name : team_info.market + ' ' + team_info.name;
  teamDocument.abbreviation = team_info.usat_id;
  return teamDocument;
}


function mongoInsertPlayers(league, team_document, team_id){
  console.log("inserting into the DB");
  if (team_id != undefined){
    var team_id = team_id;
  }

  //the players_import script doesn't pass the team_id but the document will have it
  else{
    team_id = team_document.team_id;
  }
  db.open(function(err, db){
    db.collection("players").update({team_id: team_document.team_id},
    {$set: {team_id: team_id, market: team_document.market, name: team_document.name, team_name: team_document.team_name, abbreviation: team_document.abbreviation, league: league, last_updated: new Date().toISOString().slice(0, 19).replace('T', ' '), players: team_document.players}},
    {upsert: true, multi:false}, function (err, upserted){
      if (err) {
        console.log('Ahh! An Error with Insert!' + err);
        return;
      }
    });
  });
}


formatEUSoccerPlayers = function(response, usat_id){
  var roster = {};
  var playersArray = [];
  parseString(response, function (err, result) {
    var str = result[Object.keys(result)[0]];
    roster.name = str.team[0].$.name;
      for (i=0; i < str.team.length;i++){
        for (j=0; j < str.team[i].roster.length; j++){
          for (k=0; k < str.team[i].roster[j].player.length; k++){
            var player = str.team[i].roster[j].player[k].$;
            player.full_name = player.first_name + ' ' + player.last_name;
            appendPlayerShortId(player);
            playersArray.push(player);
          }
        }
      }
  });
  roster.usat_id = usat_id;
  roster.players = playersArray;
  return roster;
}

formatMLBPlayers = function(response, team_id, api_team_id, usat_id){
  decryptedTeamId = encryption.decrypt(api_team_id);
  for (var i =0; i <response.teams.length; i++){
    if (decryptedTeamId == response.teams[i].id){
      players = response.teams[i];
      players.usat_id = usat_id;
      appendAvatarUrl(players);
      break;
    }
  }
  var teamDoc = formatPlayersDocument(team_id, players.players, players);
  return teamDoc;

}

var randImg = function(league, teamName) {
      var teamName = teamName.replace(/\s+/g, '-').toLowerCase();
      var images = [];
      switch (league) {
        case "mlb":
          var path = '../images/stadiums/mlb_stadiums/';
          images[0] = "MLB-" + teamName + "-stadium.jpg";
        break;
        case "nfl":
          var path = '../images/stadiums/nfl_stadiums/';
            images[0] = "nfl-49ers-stadium.jpg",
            images[1] = "nfl-giants-stadium.jpg",
            images[2] = "nfl-patriots-stadium.jpg",
            images[3] = "nfl-ravens-stadium.jpg",
            images[4] = "nfl-seahawks-stadium.jpg",
            images[5] = "nfl-bills-stadium.jpg",
            images[6] = "nfl-chiefs-stadium.jpg",
            images[7] = "nfl-jets-stadium.jpg",
            images[8] = "nfl-raiders-stadium.jpg",
            images[9] = "nfl-cowboys-stadium.jpg"
          break;
        case "nhl":
          var path = '../images/stadiums/nhl_stadiums/';
            images[0] = "nhl-flyers-stadium.jpg",
            images[1] = "nhl-redwings-stadium.jpg",
            images[2] = "nhl-sabres-stadium.jpg",
            images[3] = "nhl-thrashers-stadium.jpg",
            images[4] = "nhl-predators-stadium.jpg"
          break;
        case "nba":
          var path = '../images/stadiums/nba_stadiums/';
            images[0] = "NBA-kings-stadium.jpg",
            images[1] = "NBA-bucks-stadium.jpg",
            images[2] = "NBA-warriors-stadium.jpg",
            images[3] = "NBA-pelicans-stadium.jpg",
            images[4] = "NBA-hornets-stadium.jpg",
            images[5] = "NBA-rockets-stadium.jpg",
            images[6] = "NBA-knicks-stadium.jpg",
            images[7] = "NBA-heat-stadium.jpg"
        break;
        case "eu_soccer":
          var path = '../images/stadiums/eu_soccer_stadiums/';
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

    var pluckPlayerFromName= function(player, callback, league){
        db.collection('players').findOne({$and: [{"abbreviation": player.team}, {"league": league}]},function (err, doc){
          var playerInfo = {};
          if (typeof(doc)!= "undefined" && doc !== null){
            for (i=0;i<doc.players.length;i++)  {
              if (doc.players[i].full_name.toLowerCase() == player.name.toLowerCase()){
                playerInfo = doc.players[i];
                playerInfo.stat = player.top;
                top_category.push(playerInfo);  //aggregates the list of players
              }
            }
            //let async know the work is done
            callback();
          }
          else {
          //let async know it's done
          callback();
          }
        });
    }

var emptyCategoryArray = function(){
  top_category = [];
}



var insertLeaders= function (data){
    var leadersList = {};
    leadersList.league = data.league;
    leadersList.category = data.category;
    leadersList.team_id = data.team_id;
    leadersList.description = teams_model.fetchStatDescription(data.category);
    leadersList.players = (typeof data.players == 'undefined')? top_category: data.players;
    leadersList.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.open(function(err, db){
      db.collection('leaders').update({"$and" : [{league: leadersList.league},{category: leadersList.category}]},
        {$set: leadersList},
        {upsert: true, multi:false}, function(err, insert){
      if (err){
        console.log("error inserting into mongo" + err);
      }
      else{
        emptyCategoryArray();
      }
      });
  })

}

var abbreviationHelper = function(league, abbreviation){
  switch (league){
    case 'nhl':
      switch (abbreviation){
        /*case 'WSH':
          abbreviation = 'WAS';
        break;*/
        default:
        abbreviation = abbreviation;
        break;
      }
    break;
    case 'nba':
      switch (abbreviation){
        case 'GS':
          abbreviation = 'GSW'
          break;
        case 'NO':
          abbreviation = 'NOP'
          break;
        case 'NY':
          abbreviation = 'NYK'
          break;
        case 'SA':
          abbreviation = 'SAS'
          break;
        case 'PHO':
          abbreviation = 'PHX'
          break;
        default:
          abbreviation = abbreviation;
      }
    case 'mlb':
      switch (abbreviation){
        case 'CHW':
          abbreviation = 'CWS'
          break;
        case 'WAS':
          abbreviation = 'WSH'
        default:
          abbreviation = abbreviation;
      }
    break;
    case 'eu_soccer':
      switch (abbreviation){
        case 'MCY':
          abbreviation = 'MC';
        break;
        case 'MAN':
          abbreviation = "MU";
        break;
        case 'SHN':
          abbreviation = 'SOU';
        break;
        case 'LIV':
          abbreviation = 'LFC';
        break;
        case 'NCU':
          abbreviation = 'NEW';
        break;
        case 'RMD':
          abbreviation = 'MAD';
        break;
        case 'CEL':
          abbreviation = 'CEV';
        break;
      }

  }
  return abbreviation;
}



module.exports = {
  returnPlayers: returnPlayers,
  fetchPlayersFromApi: fetchPlayersFromApi,
  fetchPlayers: fetchPlayers,
  formatPlayers: formatPlayers,
  formatNBAPlayers: formatNBAPlayers,
  formatPlayersDocument: formatPlayersDocument,
  mongoInsertPlayers: mongoInsertPlayers,
  sortNBA: sortNBA,
  pluckPlayerFromName: pluckPlayerFromName,
  insertLeaders: insertLeaders,
  intreturnPlayers: intreturnPlayers,
  emptyCategoryArray: emptyCategoryArray,
  fetchTeamColors: fetchTeamColors,
  abbreviationHelper: abbreviationHelper,
  randImg: randImg,
  goatsLeadersArray: goatsLeadersArray
}
