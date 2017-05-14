var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var chatter = require('./chatter')
var session = require("express-session");

// application assets
app.use(express.static('views'));

var sessionMiddleware = session({
    companyId: "",
    resave: true,
    secret: "not really a secret yet",
    saveUninitialized: false
});

// give socket.io session data
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);

// listen to requests and let chatter handle socket requests
io.on('connection', chatter);

// ROUTES
app.get('/chat', function(req, res) {
	res.sendFile(__dirname + '/views/chat.html');
})

app.get('/chat/:companyId', function(req, res) {
	// set company id so that it can be used
	req.session.companyId = req.params.companyId
	res.sendFile(__dirname + '/views/chat.html');
})

// redirect all other routes to the webapp
app.all('/*', function ( req, res ) {
		// TODO send different page if not logged in
        res.sendFile(__dirname + '/views/index.html');
    })

const port = process.env.PORT || '3000';
app.set('port', port);

// make the server start and listen
server.listen(port, function () {
  console.log("Chakubot is running on port " + port);
});