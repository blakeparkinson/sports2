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

    db = mongojs.connect(uri);
    //db = mongojs.connect(uri, ["teams"]),
    //db_players = mongojs.connect(uri, ["players"]);




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
  players = fetchPlayers(team_id, res);
});

var returnPlayers = function (players, res){
    res.json(players);
}

  
var fetchPlayers = function(team_id, res){

  db.collection('players').find({team_id : team_id}).toArray(function (err, items){
        if (items.length > 0){
            return items
        }
  });
    fetchPlayersFromApi(team_id, res)
}



var fetchPlayersFromApi = function(team_id, res){
var json_response = '';
var players = {};
  request('https://api.sportsdatallc.org/nba-t3/seasontd/2014/reg/teams/'+team_id+'/statistics.json?api_key='+nba_key, function (error, response, body) {
    if (!error && response.statusCode == 200) {

        json_response = JSON.parse(body);
                //console.log("team type is "+typeof players);
        //console.log("team length is "+Object.keys(players).length);
        players = formatPlayers(json_response, team_id, res);
        return players;
      } 
    }); 

}


var formatPlayers = function(response, team_id, res){
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
  var team = formatPlayersDocument(team_id, playersarray, res);

}
  

var formatPlayersDocument = function(team_id, players, res){
  teamDocument = {};
  var teamfacts = db.collection('teams').find({"team_id": team_id },{_id: 1, name: 1, market: 1});
  var teamfacts2 = db.collection('teams').find({"team_id": team_id },{_id: 1, name: 1, market: 1}).toArray(function (err,items){
  });

  teamDocument["team_id"] = team_id;
  teamDocument["team_name"] = teamfacts.name;
  teamDocument["market"] = teamfacts;
  teamDocument["players"] = players; 
  //teamDocumnet[last_updated] = new date();
  returnPlayers(teamDocument, res);
}


function mongoInsertPlayers(team_document){
  console.log("inserting into the DB");
  db.open(function(err, db){
    db.collection("players").insert(team_document, function (err, inserted) {
      // check err...
    });
  })
}

  



module.exports = router;
