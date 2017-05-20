var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : "chakudb.ck4vii9lldev.us-east-1.rds.amazonaws.com",
  user     : "master",
  password : "DrHelp91yes",
});

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});

connection.end();