//to run tests type "npm test" from the root dir

var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var players_model = require('../models/players.js');
var _ = require('lodash');
var common = require('../routes/common')
var config = common.config();
var request = require('request');


describe('tests', function(){
  describe('randImg', function(){
    it('should return an image matching the corresponding league', function(){
      var leagues = ['nba', 'mlb', 'nfl', 'nhl', 'eu_soccer'];
      for (var i =0; i < leagues.length; i++){
        var img = players_model.randImg(leagues[i], '');
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
  describe('baseballTeamApi', function(){
    it('should return baseball teams', function(done){
      var endpoint = 'https://api.sportsdatallc.org/mlb-t5/league/hierarchy.json?api_key=' + config.mlb_key;
      request(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var parseResponse = JSON.parse(body);
          //American and National
          expect(parseResponse.leagues).to.have.length(2);
          done();
        }
        else{
          console.log(error);
        }
      });
    })
  })
  describe('fetchTeamColors', function(){
    it('should return a primary and secondary hex representing the teams colors', function(){
      var colors = players_model.fetchTeamColors('nhl', 'Canucks');
      expect(colors.primary_hex).to.equal('#07346F');
      expect(colors.secondary_hex).to.equal('#047A4A');
    })
  })
})