var express = require('express');
var router = express.Router();
var http = require("http");
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: '1600051886893474',
    clientSecret: 'fa62ae10084531ef58f819c0008c0b15',
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	//check if exists / save user to database (http://passportjs.org/guide/profile/)
  	/*
  	 User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return done(err, user);
    });
	*/
  //	console.log(profile);
  	return done(null,profile);  
  	  		
  }
));

router.get('/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/teams',
                                      failureRedirect: '/login' }));


module.exports = router;

