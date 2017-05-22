var mysql = require('mysql');

const connect_info = {
	connectionLimit : 100, //important
	host     : "chakudb.ck4vii9lldev.us-east-1.rds.amazonaws.com",
	user     : "master",
	password : "DrHelp91yes",
	database: 'mydb'
}

var pool = mysql.createPool(connect_info)

function doQuery(query, data, callback){
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          throw err;
        }   
        connection.query(query, data,function(err,results){
            connection.release();
            if(!err) {
                callback(null, results);
            } else {
            	callback(err, null);
            }
        });
        connection.on('error', function(err) {      
              throw err;
              return;     
        });
    });
}

// object to hold all exported functions
let funcs = {}

// inserts data into the log for a conversation
// needs to have the fields: company_id, interview_id, log_index, message, question_id, and from_client
funcs.insertLog = function(data) {
	doQuery("INSERT INTO chat_logs SET ?", data, function(err, results) {
		if(err) {
			console.log("failed to add", data)
		}
	});
}

// gets the log for companyId, interviewId
// also OMG console.log is a valid callback function
funcs.getLog = function(companyId, interviewId, callback) {
	doQuery("SELECT * FROM chat_logs WHERE company_id=? AND interview_id=? ORDER by log_index", [companyId, interviewId], function(err, results) {
		callback(results)
	});
}

// adds a new user to the database
funcs.addUser = function(data, callback) {
	doQuery("INSERT INTO accounts SET ?", data, function(err, results) {
		if(err) {
			callback(false)
		} else {
			callback(true)
		}
	});
}

// used for checking if the email exists
funcs.getUserFromEmail = function(email, callback) {
	doQuery("SELECT * FROM accounts WHERE email=?", [email], function(err, results) {
		callback(results)
	});
}

module.exports = funcs;
