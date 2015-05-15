// run this script by cd'ing into the scripts dir and 
//then typing "node team_import.js [league you want to import]"
// for example to import nba, you do "node team_import.js nba"

var images_list = require('../lists/images2.js');
var common = require('../routes/common')
var config = common.config();


var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require("http"),
    mongojs = require("mongojs"),

    db = mongojs.connect(config.mongo_uri);

var encryption = require('../encryption.js');
var request = require('request');
var api_key = '';
var ver = '';
var endpoint = '';
var teams = [];
var supported_leagues = ['nba', 'nfl', 'mlb', 'nhl', 'eu_soccer'];
var shortId = require('shortid');
var teams_model = require('../models/teams.js');
var _ = require('lodash');

//process.argv grabs the command line arguments
var league = process.argv[2];

//deleting a team sample
/*var d = {};
d.league = 'nhl';

teams_model.deleteItem(d,'leaders');
return;*/

if (supported_leagues.indexOf(league) == -1){
  console.log('We cant do this league yet.');
  return
}

switch (league){
	case 'nba':
		endpoint = 'https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + config.nba_key;
		break;
	//mlb seems to only return in xml for now :(
	case 'mlb':
		endpoint = 'https://api.sportsdatallc.org/mlb-t5/league/hierarchy.json?api_key=' + config.mlb_key;
		break;
	case 'nfl':
		endpoint = 'https://api.sportsdatallc.org/nfl-t1/teams/hierarchy.json?api_key='+ config.nfl_key;
		break;
  case 'nhl':
    endpoint = 'https://api.sportsdatallc.org/nhl-t3/league/hierarchy.json?api_key='+ config.nhl_key;
    break;
  case 'eu_soccer':
    endpoint = 'https://api.sportsdatallc.org/soccer-t2/eu/teams/hierarchy.xml?api_key='+ config.soccer_eu_key;
}

    request(endpoint, function (error, response, body) {
      if (!error && response.statusCode == 200) {
            switch (league){
	        		case 'nba':
                teams = formatNbaTeams(response.body);
                break;
	            case 'nfl':
              case 'nhl':
	            	teams = formatNflAndNhlTeams(response.body, league);
	            	break;
              case 'mlb':
                teams = formatMlbTeams(response.body);
                break;
               case 'eu_soccer':
                teams = formatSoccerTeams(response.body);
                break;
	           }
        mongoInsert(teams, league);
      }
      else{
        console.log('somethings really terrible happened');
      }
    });

  
  function mongoInsert(teams){
    db.open(function(err, client){
      client.collection("teams", function(err, col) {
        for (var i = 0; i < teams.length; i++) {
          if (league == 'eu_soccer'){
              //soccer teams don't really have markets, their names include their citys. For our puropses (rendering), this will go into the market field
              col.insert({_id:shortId.generate(), team_id:encryption.encrypt(teams[i].id), market:teams[i].name, name: '', country:teams[i].country, league:league, type: 'roster'}, function() {});
          }
          else{
            //really the only 4 key:value pairs we care about for now
            col.insert({_id:shortId.generate(), team_id:encryption.encrypt(teams[i].id), name:teams[i].name, market:teams[i].market, league:league, usat_id: teams[i].usat_id, type: 'roster'}, function() {});
          }
        }
      })
  });

}


var formatNbaTeams = function(response){
  var  hierarchy_response = JSON.parse(response);
  for (i=0;i<hierarchy_response.conferences.length;i++){
    for (j=0;j<hierarchy_response.conferences[i].divisions.length;j++){
      for(k=0; k< hierarchy_response.conferences[i].divisions[j].teams.length; k++){
        var team_item = hierarchy_response.conferences[i].divisions[j].teams[k];
        for (b=0;b<images_list.images.length;b++){
          league_temp = images_list.images[b];
          for (c=0;c<Object.keys(league_temp.teams).length;c++){
            team_name = team_item.market+' '+team_item.name;
            if (team_name == league_temp.teams[c].team_name){
              var team_initials = league_temp.teams[c].usat_id;
              team_item.usat_id = team_initials;
            }
          }
        }
        teams.push(team_item);
      }
    }   
  }
return teams
}


var formatNflAndNhlTeams = function(response, league){
  var  hierarchy_response = JSON.parse(response);
  for (i=0;i<hierarchy_response.conferences.length;i++){
    for (j=0;j<hierarchy_response.conferences[i].divisions.length;j++){
      for(k=0; k< hierarchy_response.conferences[i].divisions[j].teams.length; k++){
        //set the usat_id to the city shorthand
        if (league == 'nhl'){
          hierarchy_response.conferences[i].divisions[j].teams[k].usat_id = hierarchy_response.conferences[i].divisions[j].teams[k].alias
        }
        else{
          hierarchy_response.conferences[i].divisions[j].teams[k].usat_id = hierarchy_response.conferences[i].divisions[j].teams[k].id
        }
        teams.push(hierarchy_response.conferences[i].divisions[j].teams[k]);
      }
    }   
  }
return teams
}

var formatMlbTeams = function(response){
  response = JSON.parse(response);
  //start teh loops
   for (i=0; i < response.leagues.length; i++){
      var divisions = response.leagues[i].divisions;
      for (j=0; j < divisions.length; j++){
        var baseballTeams = divisions[j].teams;
        for (x=0; x < baseballTeams.length; x++){
          baseballTeams[x].usat_id = baseballTeams[x].abbr;
          teams.push(baseballTeams[x]);
        }
      }
    }
  return teams;
}

formatSoccerTeams = function(response){
  //honree says these are the soccer stuff we care about
  var countries = ['Germany', 'England', 'Italy', 'Spain'],
      leagues = ['Premier League', 'Bundesliga', 'Serie A', 'Primera Division'];
  parseString(response, function (err, result) {
    var str = result[Object.keys(result)[0]];
         for (i=0; i < str.category.length;i++){
            //check to see if they are in the right country
            if (countries.indexOf(str.category[i].$.name) > -1){
              for (j=0; j < str.category[i].tournament_group.length; j++){
                  //check to see if they are in the right league
                  if (leagues.indexOf(str.category[i].tournament_group[j].$.name) > -1){
                    for(k=0; k < str.category[i].tournament_group[j].tournament.length; k++){
                      //no idea what's going on at this point
                      if (str.category[i].tournament_group[j].tournament[k].$.name != 'Bundesliga Relegation/Promotion'){
                        for (l=0; l < str.category[i].tournament_group[j].tournament[k].team.length; l++){
                          teams.push(str.category[i].tournament_group[j].tournament[k].team[l].$);
                        }
                      }
                    }
                  }
              }
            }
                
         }

  });
  return teams;
}



