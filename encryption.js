var crypto = require('crypto');


//  ORIGINAL 
/*
var encrypt = function(text){
	var cipher = crypto.createCipher('aes192', 'mypassword');   // algorithm and password for encryption
	var cipherText = cipher.update(text, 'utf8','binary');   // encrypt text from utf8 to binary
	cipherText += cipher.final('binary'); 
	var encoded = new Buffer(cipherText, 'binary').toString('base64');
	console.log("cipherText length encrypted2"+encoded.length);
	return encoded
}


var decrypt = function(encrypted_text){
	console.log("decrypt length"+ encrypted_text.length);
	encrypted_text = new Buffer(encrypted_text, 'base64').toString('binary');
	var decipher = crypto.createDecipher('aes192', 'mypassword');    // algorithm and password for the decryption
	var result = decipher.update(encrypted_text, 'binary', 'utf8');  // text to decrypt, from binary to utf8
	result += decipher.final('utf8'); 
	console.log("result length"+ result.length);
	return result
} */


var encrypt = function(text){
	var cipher = crypto.createCipher("bf-ecb", "key");  // algorithm and key. need to store key in config file
	var data = cipher.update(text, "utf8", "base64");   // from utf8 to base64
	data += cipher.final("base64");
	console.log(data);   
	return data
}

/*
var decrypt = function(data){
	var decipher = crypto.createDecipher("bf-ecb", "key");   // algorithm and key. need to store key in config file
	data = decipher.update(data, "base64", "utf8");  // from base64 to utf8
	console.log(data.length);   // this length is where I'm running into issues. 
	data += decipher.final("utf8");
	return data
} */

var decrypt = function(data){
/*	var cipher = crypto.createCipher("bf-ecb", "key");
	var data = cipher.update(data, "utf8", "base64");
	data += cipher.final("base64");
	console.log("after encryption"+ data);*/
	var decipher = crypto.createDecipher("bf-ecb", "key");
	data = decipher.update(data, "base64", "utf8");
	data += decipher.final("utf8");
	console.log("after decryption"+ data);
	return data
}


module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}


/*   Possible Encryption Algorithyms

[ 'CAST-cbc',
  'aes-128-cbc',
  'aes-128-cbc-hmac-sha1',
  'aes-128-cfb',
  'aes-128-cfb1',
  'aes-128-cfb8',
  'aes-128-ctr',
  'aes-128-ecb',
  'aes-128-gcm',
  'aes-128-ofb',
  'aes-128-xts',
  'aes-192-cbc',
  'aes-192-cfb',
  'aes-192-cfb1',
  'aes-192-cfb8',
  'aes-192-ctr',
  'aes-192-ecb',
  'aes-192-gcm',
  'aes-192-ofb',
  'aes-256-cbc',
  'aes-256-cbc-hmac-sha1',
  'aes-256-cfb',
  'aes-256-cfb1',
  'aes-256-cfb8',
  'aes-256-ctr',
  'aes-256-ecb',
  'aes-256-gcm',
  'aes-256-ofb',
  'aes-256-xts',
  'aes128',
  'aes192',
  'aes256',
  'bf',
  'bf-cbc',
  'bf-cfb',
  'bf-ecb',
  'bf-ofb',
  'blowfish',
  'camellia-128-cbc',
  'camellia-128-cfb',
  'camellia-128-cfb1',
  'camellia-128-cfb8',
  'camellia-128-ecb',
  'camellia-128-ofb',
  'camellia-192-cbc',
  'camellia-192-cfb',
  'camellia-192-cfb1',
  'camellia-192-cfb8',
  'camellia-192-ecb',
  'camellia-192-ofb',
  'camellia-256-cbc',
  'camellia-256-cfb',
  'camellia-256-cfb1',
  'camellia-256-cfb8',
  'camellia-256-ecb',
  'camellia-256-ofb',
  'camellia128',
  'camellia192',
  'camellia256',
  'cast',
  'cast-cbc',
  'cast5-cbc',
  'cast5-cfb',
  'cast5-ecb',
  'cast5-ofb',
  'des',
  'des-cbc',
  'des-cfb',
  'des-cfb1',
  'des-cfb8',
  'des-ecb',
  'des-ede',
  'des-ede-cbc',
  'des-ede-cfb',
  'des-ede-ofb',
  'des-ede3',
  'des-ede3-cbc',
  'des-ede3-cfb',
  'des-ede3-cfb1',
  'des-ede3-cfb8',
  'des-ede3-ofb',
  'des-ofb',
  'des3',
  'desx',
  'desx-cbc',
  'id-aes128-GCM',
  'id-aes192-GCM',
  'id-aes256-GCM',
  'idea',
  'idea-cbc',
  'idea-cfb',
  'idea-ecb',
  'idea-ofb',
  'rc2',
  'rc2-40-cbc',
  'rc2-64-cbc',
  'rc2-cbc',
  'rc2-cfb',
  'rc2-ecb',
  'rc2-ofb',
  'rc4',
  'rc4-40',
  'rc4-hmac-md5',
  'seed',
  'seed-cbc',
  'seed-cfb',
  'seed-ecb',
  'seed-ofb' ]   */


