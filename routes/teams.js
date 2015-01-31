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
var request = require('request');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz',

    db = mongojs.connect(uri, ["teams"]),
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
  team_id = req.query["team_id"];
  console.log("team id is: "+team_id);
  players = fetchPlayers(team_id);
  // I think this res.json() fires too quickly. But I don't understand callbacks soooo
  res.json(players);
});





  
var fetchPlayers = function(team_id){ 
      db_players.collection('players').find({team_id : team_id}).toArray(function (err, items){
        secondFunction(items, team_id);
      });  
}


var secondFunction = function(mongoresult, team_id){
  console.log("mongoresult type"+ typeof mongoresult);
  console.log("mong size"+ Object.keys(mongoresult).length);
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
  
var newfunction = function(items){
  return items;
}

var formatPlayersDocument = function(team_id, players){
  teamDocument = {};
  var teamfacts = db.collection('teams').find({"team_id": team_id },{_id: 1, name: 1, market: 1});
  var teamfacts2 = db.collection('teams').find({"team_id": team_id },{_id: 1, name: 1, market: 1}).toArray(function (err,items){
    newfunction(items);
  });

  teamDocument["team_id"] = team_id;
  teamDocument["team_name"] = teamfacts.name;
  teamDocument["market"] = teamfacts;
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
