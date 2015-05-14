//to run tests type "npm test" from the root dir

var assert = require("assert");
var players_model = require('../models/players.js');
var _ = require('lodash');


describe('tests', function(){
  describe('pics', function(){
    it('should return an image matching the corresponding league', function(){
      var leagues = ['nba', 'mlb', 'nfl', 'nhl', 'eu_soccer'];
      for (var i =0; i < leagues.length; i++){
        var img = players_model.randImg(leagues[i]);
        //the image should have the league text ('nba, 'mlb' ,'nhl', etc...) in the name
        assert.notEqual(-1,img.indexOf(leagues[i]));
      }
    })
  })
})