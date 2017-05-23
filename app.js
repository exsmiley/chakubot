require('events').EventEmitter.prototype._maxListeners = 100; // stop one memory leak?
var express = require('express');
var session = require("express-session");
var bodyParser = require('body-parser')
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var chatter = require('./backend/chatter')
var db = require('./backend/dbConnector');
var am = require('./backend/accountManager')

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
io.on('connection', chatter.chat);

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

// gets a list of general information for all of the interviews conducted
app.get('/api/report_data', function(req, res) {
    if(req.session.loggedIn) {
        db.getInterviewed(req.session.userInfo.company_id, function(results) {
            res.send(results)
        })
    } else {
        res.send({})
    }
})

// gets the data for a specific interview report based on companyId and interviewId
app.get('/api/interview_data', function(req, res) {
    if(req.session.loggedIn) {
        const companyId = req.session.userInfo.company_id
        const interviewId = req.query.interviewId

        db.getLog(companyId, interviewId, function(results) {
            res.send(results)
        });   
    } else {
        res.send({})
    }
});

// gets a JSON mapping question ids to the topic they are from
app.get('/api/question_map', function(req, res) {
    if(req.session.loggedIn) {
        res.send(chatter.topicMap())
    } else {
        res.send({})
    }
})

// client submits scores for interview questions
app.post('/api/submitScores', function(req, res) {
    if(req.session.loggedIn) {
        const companyId = req.session.userInfo.company_id
        const interviewId = req.body.interviewId
        for(let question of req.body.questions) {
            // do question
            let score = question.score
            db.updateInterviewScore(companyId, interviewId, question.index, score, function(success){})

            // do each answer
            for(let answer of question.answers) {
                db.updateInterviewScore(companyId, interviewId, answer.index, score, function(success){})
            }
        }
        res.send({"success": true})
    } else {
        res.send({"success": false})
    }
});

// tries to sign up with an account
app.post('/api/signup', function(req, res) {
    am.makeAccount(req.body.email, req.body.pwd, req.body.companyName, function(worked, userInfo) {
        req.session.loggedIn = worked
        req.session.userInfo = userInfo
        res.send({"accountMade": worked})
    })
});

// tries to log the user in
app.post('/api/login', function(req, res) {
    am.checkLogin(req.body.email, req.body.pwd, function(worked, userInfo) {
        req.session.loggedIn = worked
        req.session.userInfo = userInfo
        res.send({"loggedIn": worked})
    })
})

// tries to log the user in
app.get('/api/userInfo', function(req, res) {
    if(req.session.loggedIn) {
        res.send(req.session.userInfo);
    } else {
        res.send({})
    }
})

// logs the user out
app.get('/logout', function(req, res) {
    req.session.loggedIn = false
    req.session.userInfo = {}
    res.redirect('/')
})

// VIEW ROUTES

// redirect all other routes to the webapp
app.all('/*', function ( req, res ) {
	// send different page if not logged in
    if(!req.session.loggedIn) {
        res.sendFile(__dirname + '/views/loggedout.html');
    } else {
        res.sendFile(__dirname + '/views/loggedin.html');
    }
})

const port = process.env.PORT || '3000';
app.set('port', port);

// make the server start and listen
server.listen(port, function () {
  console.log("Chakubot is running on port " + port);
});