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
		// TODO add print?
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
// let t = "SELECT * FROM accounts"
// let t = "CREATE TABLE accounts (    logtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,    company_id VARCHAR(25) NOT NULL,    company_name VARCHAR(255) NOT NULL,    email VARCHAR(255) NOT NULL,    password VARCHAR(255) NOT NULL,    is_main_account BOOLEAN NOT NULL,    authorization_level INT NOT NULL,        PRIMARY KEY( company_id ) );"
// const connection = mysql.createConnection(connect_info);
// 	var query = connection.query(t, function(err, results) {
// 		console.log(err)
// 		console.log(results)
// 	})
// 	connection.end();

// adds a new user to the database
funcs.addUser = function(data, callback) {
	// TODO validate user doesn't exist
	doQuery("INSERT INTO accounts SET ?", data, function(err, results) {
		// TODO add print?
		if(err) {
			console.log("failed to add", data)
			callback(false)
		} else {
			callback(true)
		}
	});
}

module.exports = funcs;
