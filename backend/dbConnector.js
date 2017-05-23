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
		if(!err)
			callback(results)
		else
			callback([])
	});
}

// gets a list of IDs for entrepreneurs that were interviewed by this company
funcs.getInterviewed = function(companyId, callback) {
	doQuery("SELECT interview_id FROM chat_logs WHERE company_id=? AND message='Thank you for taking the time for this interview!'", [companyId], function(err, results) {
		if(!err)
			callback(results)
		else
			callback([])
	});
}

// updates the score for an entry in the interview
funcs.updateInterviewScore = function(companyId, interviewId, logIndex, score, callback) {
	doQuery("UPDATE chat_logs SET score=? WHERE company_id=? AND interview_id=? AND log_index=?", [score, companyId, interviewId, logIndex], function(err, results) {
		if(err) {
			callback(false)
		} else {
			callback(true)
		}
	})
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

// gets the emails of everyone that wants an email sent everytime TODO adjust based on setting
funcs.getEmailsFromCompanyId = function(companyId, callback) {
	doQuery("SELECT email FROM accounts WHERE company_id=?", [companyId], function(err, results) {
		if(err) {
			callback([])
		}
		else {
			let emails = []
			for(let result of results) {
				emails.push(result.email)
			}
			callback(emails)
		}	
	})
}

// doQuery("UPDATE chat_logs SET company_id=? WHERE company_id=?", ['904c3560-3eac-11e7-8e53-afd21b146553', '904c3560-3eac-11e7-8e53-a'], console.log)
// doQuery("SELECT DISTINCT interview_id FROM chat_logs WHERE company_id=?", ['904c3560-3eac-11e7-8e53-a'], console.log)

module.exports = funcs;
