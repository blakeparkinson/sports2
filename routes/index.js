var express = require('express');
var router = express.Router();

var request = require('request');
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';
var nfl_key = 'b4cwkbyqfyq25fcruevj5hw2';
var ncaa_fb_key = 'rajn798e9qe8a4av49h95qju';
var mlb_key = 'wxf8qgjxs7ka6ay8ec249etg';
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';

request('https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + nba_key, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(response);
    var json_response = (JSON.parse(response.body));

    var teams = formatTeams(json_response)
  }
  else{
    console.log('somethings really terrible happened');
  }
})
var nba_teams = {
    'NOP': 'New Orleans Pelicans',
    'GSW': 'Golden State Warriors',
    'SAS': 'San Antonio Spurs'
}

var formatTeams = function(hierarchy_response){
	var conferences = [],
		divisions = [],
		teams = [];
	for (i=0;i<hierarchy_response.conferences.length;i++){
		for (j=0;j<hierarchy_response.conferences[i].divisions.length;j++){
			console.log(hierarchy_response.conferences[i].divisions[j].teams.length);
			for(k=0; k< hierarchy_response.conferences[i].divisions[j].length; k++){
			}

		}

	}
}


router.get('/', function(res, res) {
  res.render('index', {
    teams: nba_teams,
  });
});

module.exports = router;

