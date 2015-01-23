var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz';

    db = mongojs.connect(uri, ["teams"]);


var request = require('request');
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';
var nfl_key = 'b4cwkbyqfyq25fcruevj5hw2';
var ncaa_fb_key = 'rajn798e9qe8a4av49h95qju';
var mlb_key = 'wxf8qgjxs7ka6ay8ec249etg';
var nba_key = 'hdgj9e9vs9hquzc6ds22wtdy',
	teams = [];


 db.open(function(err,db){
      db.collection('teams',function(err,collection){
        collection.find().toArray(function(err, nba_teams) {
          console.log(nba_teams);
        })
      }) //collection
    }); //open
  
request('https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + nba_key, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var json_response = (JSON.parse(response.body));
    var teams = formatTeams(json_response);
    mongoInsert(teams);


    
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

//inserts the record into mongo. 
//Plan is to fetch the team id from mongo and only 
//hit api as fallback and then update mongo
function mongoInsert(teams){
  db.open(function(err, client){
    client.collection("teams", function(err, col) {
      for (var i = 0; i < teams.length; i++) {
        col.insert({id:teams[i].id, team:teams[i].name, market:teams[i].market}, function() {});
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

