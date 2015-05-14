var assert = require("assert");
var players_model = require('../models/players.js');
var _ = require('lodash');


describe('tests', function(){
	describe('pics', function(){
		it('should return an image matching the corresponding league', function(){
			var leagues = ['nba', 'mlb', 'nfl', 'nhl'];
			for (var i =0; i < leagues.length; i++){
				var img = players_model.randImg(leagues[i]);
				assert.notEqual(-1,img.indexOf(leagues[i]));
			}
		})
	})
})