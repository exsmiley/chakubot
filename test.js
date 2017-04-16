var PythonShell = require('python-shell');

var options = {
  mode: 'text',
  scriptPath: 'py',
  pythonOptions: ['-u'],
  args: ['0', "Putin eats cookies while riding horses in the shower"]
};
 
PythonShell.run('similar.py', options, function (err, results) {
  if (err) throw err;
  // results is an array consisting of messages collected during execution 
  console.log('results: %j', results);
});
