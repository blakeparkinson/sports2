var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz';

    db = mongojs.connect(uri, ["teams"]);
    db_players = mongojs.connect(uri, ["players"]);



router.get('/', function(res, res) {
      res.render('teams', {
      });
    });

//this is for the /teams page search field ajax
router.get('/team', function(req, res) {
    var term = req.query.q;
    console.log(term);
    //find the team, This syntax does a sql-type like clause with case insensitivy(sp???) with the RegEx
    db.collection('teams').find({$or: [{'name': new RegExp(term, 'i')}, {'market': new RegExp(term, 'i')}]}).toArray(function (err, items) {
    	res.json(items);
    });
});


// when players endpoint is hit, call the API/DB using that team_id
router.get('/players', function(req, res) {
  temp = req.query.split('=');
  team_id = temp[1];
  console.log("team id is: "+team_id);
  fetchPlayers(team_id)
});



var fetchPlayers = function(team_id){
  var mongoresult = db_players.players.find( { id: team_id } );  // Or however you query Mongo
  var now = new Date();
  var target = new Date(mongoresult.last_updated);
  var daterange = now.getTime() - target.getTime();
  // if no results or the results are more than 24 hours old...
  if (mongoresult.length == 0 || daterange > 86400){
    var players = fetchPlayersFromApi(team_id);
    var teamDocument = formatPlayersDocument(team_id, players);
    mongoInsertPlayers(teamDocument);
    console.log(teamDocument);
    return teamDocument;  //pass this over to client side to render
  }
  else { 
    return mongoresult //already fresh in the DB so just pass this over to client side to render
  }
  
}

var fetchPlayersFromApi = function(team_id){
  request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team_id+'/statistics.json?api_key='+nba_key)
    var json_response = (JSON.parse(response.body));
    players = formatPlayers(json_response);
    return players
}


function mongoInsertPlayers(players){
  db_players.open(function(err, client){
    client.collection("players", function(err, col) {
     db_players.players.insert( players );
    })
  });

}

var formatPlayersDocument = function(team_id, players){
  teamDocument = {};
  teamDocument[team_id] = team_id;
  teamDocument[id] = db.teams.find( { team_id: team_id }, { id: 1});
  teamDocument[team_name] = db.teams.find( { team_id: team_id }, { name: 1});
  teamDocument[market] = db.teams.find( { team_id: team_id }, { market: 1});
  teamDocument[players] = players;
  return teamDocument;
}


var formatPlayers = function(response){
  playersarray = [];
  for (i=0;i<response.players.length;i++){
    playersarray[i] = {};
    for(var key in response.players[i]){
      if (key != "total" && key != "average"){
        var value = response.players[i][key];
        playersarray[i][key] = value;
      }
      else if (key =="total"){
        for(var key in response.players[i].total) {
          var value = response.players[i].total[key];
          playersarray[i]["total_"+key] = value;
        }
      }
      else {
        for(var key in response.players[i].average) {
          var value = response.players[i].average[key];
          playersarray[i]["average_"+key] = value;
        }
      }
    }
  }
  return playersarray;
}














module.exports = router;
