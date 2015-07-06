var env = require('../env.json');
var session = require('express-session'); //express-session is currently working, but is deprecated
var RedisStore = require('connect-redis')(session);
var MobileDetect = require('mobile-detect');



exports.config = function() {
  return env;
};


exports.isProduction = (process.env.NODE_ENV == 'production')? true : false;

// Production MongoDB vs. Dev MongoDB
exports.mongo_uri = (process.env.NODE_ENV == 'production')? env.mongo_prod_uri: env.mongo_staging_uri;


// Check for RedistoGo Url to use local redis when local mode is production, and production redis when truly live.
if (process.env.REDISTOGO_URL){
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  exports.redisClient = require("redis").createClient(rtg.port, rtg.hostname);
  exports.redisClient.auth(rtg.auth.split(":")[1]);
}
else{
  var redis = require("redis");
    exports.redisClient = redis.createClient({detect_buffers: true})
}

exports.isMobile = function(req){
  var isMobile = false;
  var md = new MobileDetect(req.headers['user-agent']);
  if (md.mobile() != null){
    isMobile = true;
  }
  return isMobile
}
