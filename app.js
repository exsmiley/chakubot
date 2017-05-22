var express = require('express');
var session = require("express-session");
var bodyParser = require('body-parser')
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var chatter = require('./chatter')
var db = require('./dbConnector');
var am = require('./accountManager')

// application assets
app.use(express.static('views'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// TODO use connect-mssql for the server side session store, avoid memory leaks
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

// API ROUTES

// gets the data for a report based on companyId and interviewId
app.get('/api/report_data', function(req, res) {
    const companyId = req.query.companyId
    const interviewId = req.query.interviewId

    db.getLog(companyId, interviewId, function(results) {
        res.send(results)
    });
});

// tries to sign up with an account
app.post('/api/signup', function(req, res) {
    am.makeAccount(req.body.email, req.body.pwd, req.body.companyName, function(worked) {
        req.session.loggedIn = worked
        res.send({"accountMade": worked})
    })
});

// tries to log the user in
app.post('/api/login', function(req, res) {
    am.checkLogin(req.body.email, req.body.pwd, function(worked) {
        req.session.loggedIn = worked
        res.send({"loggedIn": worked})
    })
})

// logs the user out
app.get('/logout', function(req, res) {
    console.log("logging out?")
    req.session.loggedIn = false
    res.redirect("/")
})

// VIEW ROUTES

// redirect all other routes to the webapp
app.all('/*', function ( req, res ) {
	// send different page if not logged in
    if(!req.session.loggedIn) {
        res.sendFile(__dirname + '/views/indexloggedout.html');
    } else {
        res.sendFile(__dirname + '/views/indexloggedin.html');
    }
})

const port = process.env.PORT || '3000';
app.set('port', port);

// make the server start and listen
server.listen(port, function () {
  console.log("Chakubot is running on port " + port);
});