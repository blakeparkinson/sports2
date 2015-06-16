var env = require('../env.json');
var session = require('express-session'); //express-session is currently working, but is deprecated
var RedisStore = require('connect-redis')(session);

exports.config = function() {
  return env;
};

exports.isProduction = (process.env.NODE_ENV == 'production')? true : false;

// Production MongoDB vs. Dev MongoDB
exports.mongo_uri = (process.env.NODE_ENV == 'production')? 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz':'mongodb://root:root@ds043982.mongolab.com:43982/rosterblitzstaging'


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

