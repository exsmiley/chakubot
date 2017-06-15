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

doQuery("SELECT * FROM interviews", [], function(err, results) {
	console.log(results)
	end()
})


function end() {
	pool.end(function (err) {
	  // all connections in the pool have ended
	});
}
