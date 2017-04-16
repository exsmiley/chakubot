var PythonShell = require('python-shell');

var analyzer = {}

analyzer.findSimilar = function(num, message, callback) {
	var options = {
	  mode: 'text',
	  scriptPath: 'py',
	  pythonOptions: ['-u'],
	  args: [num, message]
	};
	
	PythonShell.run('similar.py', options, function (err, results) {
		// TODO decide what to do when the answer is too short to give an adequate result
		if (err) results = [0]; // that means an error occurred because of divide by 0 probably
		// results is an array consisting of messages collected during execution
		// console.log('results: %j', results);
		callback(results[0])
	});
}

module.exports = analyzer;