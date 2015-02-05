var express = require('express');
var router = express.Router();
var common = require('./common')
var config = common.config();
var http = require("http");
var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



passport.use(new FacebookStrategy({
    clientID: config.facebook_client_id,
    clientSecret: config.facebook_client_secret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback: true
  },
  function(req,accessToken, refreshToken, profile, done) {
    req.session.facebook = profile;
    req.session.facebook.token = accessToken;
    req.session.facebook.auth = true;
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

passport.use(new TwitterStrategy({
    consumerKey: config.twitter_consumer_key,
    consumerSecret: config.twitter_consumer_secret,
    callbackURL: "http://localhost:3000/auth/twitter/callback",
    passReqToCallback: true
  },
  function(req,token, tokenSecret, profile, done) {
      req.session.twitter = profile;
      req.session.twitter.auth = true;
      req.session.twitter.token = token;
    /*User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });*/
    return done(null,profile); 
  }
));

router.get('/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/facebook/callback', passport.authenticate('facebook', 
  { successRedirect: '/auth',
   failureRedirect: '/login' 
 }));

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', passport.authenticate('twitter', { 
  successRedirect: '/auth',
  failureRedirect: '/login' 
})
);

router.get('/', function(res, res) {
      res.render('auth', {
        special_layout : true
      });
    });



module.exports = router;

