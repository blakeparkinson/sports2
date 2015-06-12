var env = require('../env.json');
var session = require('express-session'); //express-session is currently working, but is deprecated
var RedisStore = require('connect-redis')(session);

exports.config = function() {
  return env;
};

exports.isProduction = (process.env.NODE_ENV == 'production')? true : false;



// Redis has local and production modes
if (process.env.REDISTOGO_URL){
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  exports.redisClient = require("redis").createClient(rtg.port, rtg.hostname);
  exports.redisClient.auth(rtg.auth.split(":")[1]);
}
else{
  var redis = require("redis");
    exports.redisClient = redis.createClient({detect_buffers: true})
}
