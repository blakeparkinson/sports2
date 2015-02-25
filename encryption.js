var crypto = require('crypto');


//  ORIGINAL 

var encrypt = function(text){
	var cipher = crypto.createCipher('aes192', 'mypassword');   // algorithm and password for encryption
	var cipherText = cipher.update(text, 'utf8','binary');   // encrypt text from utf8 to binary
	cipherText += cipher.final('binary'); 
	var encoded = new Buffer(cipherText, 'binary').toString('base64');
	console.log("cipherText length encrypted2"+encoded.length);
	return encoded
}

/*var decrypt = function(encrypted_text){
	console.log("decrypt length"+ encrypted_text.length);
	var decipher = crypto.createDecipher('aes192', 'mypassword');    // algorithm and password for the decryption
	var result = decipher.update(encrypted_text, 'binary', 'utf8');  // text to decrypt, from binary to utf8
	result += decipher.final('utf8'); 
	result = result.slice(1)
	return result
}*/

var decrypt = function(encrypted_text){
	console.log("decrypt length"+ encrypted_text.length);
	encrypted_text = new Buffer(encrypted_text, 'base64').toString('binary');
	var decipher = crypto.createDecipher('aes192', 'mypassword');    // algorithm and password for the decryption
	var result = decipher.update(encrypted_text, 'binary', 'utf8');  // text to decrypt, from binary to utf8
	//result += decipher.final('utf8'); 
	console.log("result length"+ result.length);
	return result
}




 // ONE ATTEMPT AT BUFFER
/*var encrypt = function(text){
	var cipher = crypto.createCipher('aes192', 'mypassword');   // algorithm and password for encryption
	var cipherText = [cipher.update(new Buffer(text), 'utf8','binary')];   // encrypt text from utf8 to binary
	cipherText.push(cipher.final('binary')); 
	var encrypted;
	encrypted = Buffer.concat(cipherText);
	console.log("cipherText length encrypted"+encrypted.length);
	return encrypted
}

var decrypt = function(encrypted_text){
	console.log("decrypt length"+ encrypted_text.length);
	var decipher = crypto.createDecipher('aes192', 'mypassword');    // algorithm and password for the decryption
	var result = [decipher.update(new Buffer(encrypted_text), 'binary', 'utf8')];  // text to decrypt, from binary to utf8
	result.push(decipher.final('utf8'));
	var decrypted = Buffer.concat(result).toString('utf8'); 
	console.log("decrypted length "+decrypted.length)
	return decrypted
}
*/


module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}




