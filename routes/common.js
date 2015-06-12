var env = require('../env.json');

exports.config = function() {
  return env;
};

exports.isProduction = (process.env.NODE_ENV == 'production')? true : false;

exports.mongo_uri = (process.env.NODE_ENV == 'production')? 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz':'mongodb://root:root@ds043982.mongolab.com:43982/rosterblitzstaging'