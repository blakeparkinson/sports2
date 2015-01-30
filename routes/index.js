/// ----- KEYS -------///
var nba_key = 'fp9yece877dze22evcbwz84q';
var nfl_key = 'vsz2dyupsmnpsbyu7rjpqa8q';
var ncaa_fb_key = 'qfsgey5amx9vm54he8ewxwfh';
var mlb_key = '7gce52avk2cqmj65m5v7ff63';
var ncaa_mb_key = 'xrnt5gsejfjkd8qz6nd8rtbx';
var nhl_key = '6pmjhpkz4xt2e8q7pzn95wpy';
var mma_key = 'fmzetam7v54nbrbaypgy9ycw';
var ncaa_wb_key = 'nygw89t6gxzna6xgbbcchvmd';
var soccer_wc_key = 'nw49yuqy98udtprsednz8t24';
var soccer_na_key = 'hczs9xpjr3ffhbtshpj7r3n5';
var soccer_eu_key = 'sppmmqfszcc7mrqa4bfxp9xb';
var nascar_key = 'de5k375fd658a7676494hdft';
var golf_key = 'wuczn4z2ktufacuae7u8sxfc';
/// ----------END KEYS-------------/////



var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz',
    db = mongojs.connect(uri, ["teams"]);


var request = require('request'),
    teams = [];


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
        col.insert({team_id:teams[i].id, name:teams[i].name, market:teams[i].market}, function() {});
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

