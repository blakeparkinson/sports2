var express = require('express');
var request = require('request');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz';

    db = mongojs.connect(uri, ["teams"]);
    db_players = mongojs.connect(uri, ["players"]),

    nba_key = 'hdgj9e9vs9hquzc6ds22wtdy';



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
  team_id = req.query["team_id"];
  console.log("team id is: "+team_id);
  players = fetchPlayers(team_id);
  res.json(players);
});

  
var fetchPlayers = function(team_id){ 
      db_players.collection('players').find({team_id : team_id}).toArray(function (err, items){
        secondFunction(items, team_id);
      });  
}


var secondFunction = function(mongoresult, team_id){
  if(typeof mongoresult !== "undefined"){
      if (mongoresult == "[object Object]" || mongoresult  == "" /*|| daterange > 86400*/){
        console.log("we in the if statement!");
        var players = fetchPlayersFromApi(team_id); 
        return players;    //pass this over to client side to render
      }
      else { 
        console.log("we in the else statement!");
        return mongoresult //already fresh in the DB so just pass this over to client side to render
      }
    }
  else{
    console.log("broke");
  }
}


var fetchPlayersFromApi = function(team_id){
  request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team_id+'/statistics.json?api_key='+nba_key, function (error, response, body) {
    var json_response = (JSON.parse(response.body));
    var players = formatPlayers(json_response);
    var team = formatPlayersDocument(team_id, players)
    mongoInsertPlayers(team);
    return team;
  });   
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
  

var formatPlayersDocument = function(team_id, players){
  teamDocument = {};
  teamDocument["team_id"] = team_id;  
  //teamDocument[id] = db.teams.find( { team_id: team_id }, { id: 1});
  //teamDocument[team_name] = db.teams.find( { team_id: team_id }, { name: 1});
  //teamDocument[market] = db.teams.find( { team_id: team_id }, { market: 1});
  teamDocument["players"] = players; 
  //teamDocumnet[last_updated] = new date();
  return teamDocument;
}


function mongoInsertPlayers(team_document){
  console.log("inserting into the DB");
  db_players.open(function(err, client){
    client.collection("players", function(err, col) {
      db_players.players.insert( team_document );
    })
  });

  
}


module.exports = router;
