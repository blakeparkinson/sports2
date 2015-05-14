//to run tests type "npm test" from the root dir

var chai = require("chai");
var assert = chai.assert;
var players_model = require('../models/players.js');
var _ = require('lodash');


describe('tests', function(){
  describe('randImg', function(){
    it('should return an image matching the corresponding league', function(){
      var leagues = ['nba', 'mlb', 'nfl', 'nhl', 'eu_soccer'];
      for (var i =0; i < leagues.length; i++){
        var img = players_model.randImg(leagues[i]);
        //the image should have the league text ('nba, 'mlb' ,'nhl', etc...) in the name
        assert.notEqual(-1,img.indexOf(leagues[i]));
      }
    })
  })
  describe('abbreviationHelper', function(){
    it('should return a string given a particular string for an abbreviation', function(){
      var abbreviations = ['WAS', 'kdkfmdmsf', 'eu_soccer'];
      for (var i =0; i < abbreviations.length; i++){
        var result = players_model.abbreviationHelper('nba', abbreviations[i]);
        assert.typeOf(result, 'string');
      }
    })
  })
})