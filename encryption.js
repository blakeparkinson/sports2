var crypto = require('crypto');


var encrypt = function(text){
	var cipher1 = crypto.createCipher('aes256', 'password'); 
	var cipherText1 = cipher1.update(text, 'ascii','binary'); 
	cipherText1 += cipher1.final('binary'); 
	console.log('Method 1 - text:' + text ); 
	console.log('Method 1 - cipherText length:' + cipherText1.length); 
	return cipherText1
}

var decrypt = function(encrypted_text){
	var decipher1 = crypto.createDecipher('aes256', 'password'); 
	var result1 = decipher1.update(encrypted_text, 'binary', 'ascii'); 
	result1 += decipher1.final('ascii'); 
	console.log('Method 1 - result:' + result1);
	return result1
}



module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}




