var express = require('express');
var router = express.Router();

var mysql =  require('mysql');

var connection =  mysql.createConnection({
  	host : "127.0.0.1",
  	user : "root",
  	password: ""
  });

/*connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

connection.end();
*/
var request = require('request');
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';
var nfl_key = 'b4cwkbyqfyq25fcruevj5hw2';
var ncaa_fb_key = 'rajn798e9qe8a4av49h95qju';
var mlb_key = 'wxf8qgjxs7ka6ay8ec249etg';
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy',
	teams = [];


request('https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + nba_key, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var json_response = (JSON.parse(response.body));
    var teams = formatTeams(json_response);
    
 	teams.sort(compare);
 	
    // don't render the page until we have formatted our teams
    router.get('/', function(res, res) {
  		res.render('index', {
    	teams: teams,
  		});
	});
  }
  else{
    console.log('somethings really terrible happened');
  }
})

function compare(a,b) {
  if (a.market < b.market)
     return -1;
  if (a.market > b.market)
    return 1;
  return 0;
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

