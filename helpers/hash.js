/*
	hash.js
	generates hash for password, used for encryption
	
	Revision history
	Hemanth Kona, 2013.11.12: created
*/

var crypto = require('crypto');

module.exports = function(password, salt){
	var hash = crypto.createHash('sha512');
	hash.update(password, 'utf8');
	hash.update(salt, 'utf8');
	return hash.digest('base64');
};