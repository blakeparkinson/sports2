var env = require(__dirname + '/env.json');
exports.config = function() {
  console.log(env);
  return env;
};