var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var chatter = require('./chatter')

// application assets
app.use(express.static('views'))

io.on('connection', chatter);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})

var port = process.env.PORT || '3000';
app.set('port', port);

// make the server start and listen
server.listen(port, function () {
  console.log("Chakubot is running on port " + port);
});