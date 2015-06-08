var env = require('../env.json');

exports.config = function() {
  return env;
};

exports.isProduction = (process.env.NODE_ENV == 'production')? true : false;