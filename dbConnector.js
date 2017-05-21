var mysql = require('mysql');

const connect_info = {
	host     : "chakudb.ck4vii9lldev.us-east-1.rds.amazonaws.com",
	user     : "master",
	password : "DrHelp91yes",
	database: 'mydb'
}

// inserts data into the log for a conversation
// needs to have the fields: company_id, interview_id, log_index, message, question_id, and from_client
function insertLog(data) {
	const connection = mysql.createConnection(connect_info);
	connection.query("INSERT INTO chat_logs SET ?", data, function(err, results) {
		// TODO add print?
	});
	connection.end();
}

// gets the log for companyId, interviewId
// also OMG console.log is a valid callback function
function getLog(companyId, interviewId, callback) {
	const connection = mysql.createConnection(connect_info);
	var query = connection.query("SELECT * FROM chat_logs WHERE company_id=? AND interview_id=?", [companyId, interviewId], function(err, results) {
		callback(results)
	})
	connection.end();
}

module.exports = {"insertLog": insertLog, "getLog": getLog};
