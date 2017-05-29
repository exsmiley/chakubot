var crypto 	= require('crypto');
var uuidV1 = require("uuid/v1");
var db = require('./dbConnector');

let funcs = {}

// taken from https://github.com/braitsch/node-login/blob/master/app/server/modules/account-manager.js
function generateSalt() {
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

// creates a hashed version of a password
function hashPassword(pwd, salt) {
	var hash = crypto.createHash('sha256').update(salt + pwd).digest('hex');
	return salt + hash;
}

// makes an account if possible
funcs.makeAccount = function(email, pwd, companyName, callback) {
	db.getUserFromEmail(email, function(results) {
		if(!results || results.length === 0) {
			// try to make the account
			let data = {"email": email, "company_name": companyName,
						"is_main_account": true, "authorization_level": 0}

			data["password"] = hashPassword(pwd, generateSalt());
			data["company_id"] = uuidV1()
			db.addUser(data, function(success) {
				delete data["password"]
				delete data["logtime"]
				callback(success, data)
			})
		} else {
			callback(false, {})
		}
	})
}

// checks if user can login
funcs.checkLogin = function(email, pwd, callback) {
	db.getUserFromEmail(email, function(results) {
		if(!results || results.length === 0) {
			return callback(false, {})
		}

		const oldPwd = results[0]["password"];
		const salt = oldPwd.substr(0, 10);
		const enteredPwd = hashPassword(pwd, salt);
		if(oldPwd === enteredPwd) {
			let data = results[0]
			delete data["password"]
			delete data["logtime"]
			callback(true, data);
		} else {
			callback(false, {})
		}
	})
}

// funcs.makeAccount("test1", "test", "Testing Company", console.log)
// funcs.checkLogin("test1", "test1", console.log)

module.exports = funcs;