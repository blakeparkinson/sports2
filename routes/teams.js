var common = require('./common')
var config = common.config();
var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    db = mongojs.connect(config.mongo_uri);



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

    request('https://api.sportsdatallc.org/nba-t3/league/hierarchy.json?api_key=' + config.nba_key, function (error, response, body) {
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
      res.render('teams', {
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
//this is for the /teams page search field ajax
router.get('/team', function(req, res) {
    var term = req.query.q;
    console.log(term);

    //find the team, This syntax does a sql-type like clause with case insensitivy(sp???) with the RegEx
    db.collection('teams').find({$or: [{'name': new RegExp(term, 'i')}, {'market': new RegExp(term, 'i')}]}).sort({'market': 1}).toArray(function (err, items) {
    	res.json(items);
    });
});

module.exports = router;
