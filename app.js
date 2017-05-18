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

app.get('/api/report_data', function(req, res) {
    const companyId = req.query.companyId
    const interviewId = req.query.interviewId
    // TODO send log
    res.send({"log": [{"time":"2017-05-16 02:00:54","message":"Hi! I'm Chakubot!","question":-1,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:00:54","message":"I will be asking you around 5 questions.","question":-1,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:00:54","message":"Are you ready for your interview to begin?","question":-1,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:47:24","message":"yes","question":-1,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":true},{"time":"2017-05-16 02:47:24","message":"Awesome! Let's start the interview!","question":0,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:47:24","message":"What is the name of your company?","question":0,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:49:01","message":"Car-copilot","question":0,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":true},{"time":"2017-05-16 02:49:01","message":"Time for the next question.","question":["11"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:49:01","message":"Who are 3 of your competitors?","question":["11"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:50:35","message":"Google Maps, Waze, and anyone else making a navigational app. However, our app features a chatbot that works on top of Google Maps so that the user can simply talk to the bot to get directions more like if there was a person sitting next to them in the car with a map","question":["11"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":true},{"time":"2017-05-16 02:50:35","message":"Thanks!","question":["22"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:50:35","message":"How did you meet each other?","question":["22"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:51:01","message":"We were going to work together at a different company. We are both related to MIT.","question":["22"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":true},{"time":"2017-05-16 02:51:01","message":"Thank you!","question":["19"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:51:02","message":"What is your current stage of development?","question":["19"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:51:22","message":"We have not created the app yet but we are ready to start any day","question":["19"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":true},{"time":"2017-05-16 02:51:22","message":"Okay!","question":["3"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:51:22","message":"What are 5 TAGs for your company?","question":["3"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:52:18","message":"chatbot, artificial intelligence, maps, friend, copilot","question":["3"],"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":true},{"time":"2017-05-16 02:52:18","message":"Thank you for taking the time for this interview!","question":-2,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false},{"time":"2017-05-16 02:52:18","message":"I will report this to upper management and they will get back to you shortly.","question":-2,"clientID":"iG3he9WBVsXxbKp6AAAB","fromClient":false}]});
});

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