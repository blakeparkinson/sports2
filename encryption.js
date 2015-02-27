var crypto = require('crypto');
var common = require('./routes/common');
var config = common.config();

var encrypt = function(text){
	var cipher = crypto.createCipher("bf-ecb", config.encryption_key);  // algorithm and key. need to store key in config file
	var data = cipher.update(text, "utf8", "base64");   
	data += cipher.final("base64");   
	return data
}


var decrypt = function(data){
	var decipher = crypto.createDecipher("bf-ecb", config.encryption_key);
	data = decipher.update(data, "base64", "utf8");
	data += decipher.final("utf8");
	return data
}


module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}

