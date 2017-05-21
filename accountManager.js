var crypto 	= require('crypto');
var db = require('./dbConnector');

// creates a hashed version of a password
function hashPassword(pwd, callback) {
	var hash = crypto.createHash('sha256').update(pwd).digest('base64');
	callback(hash);
}