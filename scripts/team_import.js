// run this script by cd'ing into the scripts dir and 
//then typing "node team_import.js [league you want to import]"
// for example to import nba, you do "node team_import.js nba"
	
var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),

    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz';

    db = mongojs.connect(uri, ["teams"]);


var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';
var request = require('request');
var nfl_key = 'b4cwkbyqfyq25fcruevj5hw2';
var ncaa_fb_key = 'rajn798e9qe8a4av49h95qju';
var mlb_key = 'wxf8qgjxs7ka6ay8ec249etg';
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';
var api_key = '';
var ver = '';
var endpoint = '';
var teams = [];
var supported_leagues = ['nba', 'mlb'];

//process.argv grabs the command line arguments
var league = process.argv[2];

if (supported_leagues.indexOf(league) == -1){
  console.log('We cant do this league yet. Talk to Honree');
  return
}

switch (league){
	case 'nba':
		endpoint = 'https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + nba_key;
		break;
	//mlb seems to only return in xml for now :(
	case 'mlb':
		endpoint = 'https://api.sportsdatallc.org/mlb-t4/teams/2014.xml?api_key=' + mlb_key;
		break;
	case 'nfl':
		endpoint = 'https://api.sportsdatallc.org/nfl-t1/teams/hierarchy.json?api_key='+ nfl_key;
		break;
}

    request(endpoint, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json_response = (JSON.parse(response.body));
        		console.log(json_response)
        		switch (league){
	        		case 'nba':
	            	teams = formatNbaAndNflTeams(json_response);
	            	break;
	            case 'nfl':
	            	teams = formatNbaAndNflTeams(json_response);
	            	break;
	           }
       mongoInsert(teams);
      }
      else{
        console.log('somethings really terrible happened');
      }
    });

  

  function mongoInsert(teams){
  db.open(function(err, client){
    client.collection("teams", function(err, col) {
      for (var i = 0; i < teams.length; i++) {
        //really the only 3 key:value pairs we care about for now
        col.insert({team_id:teams[i].id, name:teams[i].name, market:teams[i].market}, function() {});
      }
    })
  });

}

var formatNbaAndNflTeams = function(hierarchy_response){
  for (i=0;i<hierarchy_response.conferences.length;i++){
    for (j=0;j<hierarchy_response.conferences[i].divisions.length;j++){
      for(k=0; k< hierarchy_response.conferences[i].divisions[j].teams.length; k++){
            teams.push(hierarchy_response.conferences[i].divisions[j].teams[k]);
      }
    }   
  }
return teams
}



