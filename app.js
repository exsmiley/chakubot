var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var chatter = require('./chatter')

// application assets
app.use(express.static('views'))

app.use('/chat', chatter)

app.get('/', function(req, res) {
	res.send("Hello World!")
})

// make the server start and listen
server.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Chakubot is running on port " + port);
});