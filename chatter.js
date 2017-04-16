var fs = require('fs');
var analyzer = require('./analyzer')

// LOAD initial data
questions = {"-1": {"next": [], "question": "error"}}
neutal = []

function populate_questions(s) {
	lines = s.split("\n")
	for(line of lines) {
		info = line.split("|")
		nextNodes = info[1].split(",")
		questions[info[0]] = {"next": nextNodes, "question": info[2]}
		questions[-1]["next"].push([info[0]])
	}
}

fs.readFile('txt/questions.txt', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	populate_questions(data);
});

fs.readFile('txt/neutral.txt', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	neutral = data.split("\n")
});


/**
 * Interviewer handles running the interview
 * @param client socket.io socket object to send messages to
 */
class Interviewer {

	// initializes the interviewer
	constructor(client) {
		this.client = client;
		this.state = "beginning";
		this.lastQuestion = -1; // number of last question asked
		this.numQuestionsAsked = 0;
		this.maxNumQuestions = 5;
		this.questionsAsked = new Set()

		// rolling average of similarity score
		this.totalScore = 0;
		this.numScores = 0;

		this.sendMessage("Hi! I'm Chakubot!");
		this.sendMessage("Are you ready for your interview to begin?");
	}

	/**
	 * Gets a message from the client and dispatches a reply
	 * @param message text gotten from user
	 */
	handleMessage(message) {
		let that = this;
		this.logIncomingMessage(message);

		message = message.toLowerCase()
		if(this.state === "beginning") {
			// TODO refine the yes/no detection
			if(message.includes("yes")) {
				this.state = "question";
				this.sendMessage("Okay! Let's start the interview!");

				// TODO ask a first question
				this.sendMessage(questions[0]["question"], 300)
				this.lastQuestion = 0
			} else {
				this.sendMessage("Lameeeeeeeee!");

				// delay 1.5 seconds before sending next message
				setTimeout(function(){
					if(that.state === "beginning")
						that.sendMessage("Now are you ready for the interview?");
				},1500);
			}
		} else if(this.state == "question") {
			// Gets the similarity score (TODO change number once have responses)
			analyzer.findSimilar(0, message, function(results) {
				that.totalScore += Number(results)
				that.numScores += 1
			})

			// handle advancing the question
			if(this.numQuestionsAsked >= this.maxNumQuestions) {
				this.sendMessage("Thank you for taking the time for this interview! We will let you know of next steps shortly.");
				this.state = "finished"
				this.lastQuestion = -2

				// give a moment for the last similarity score to come in
				setTimeout(function(){
					console.log("The score is: ", that.totalScore/that.numScores)
				},1500);
			} else {
				// add filler sentences between questions
				this.sendMessage(neutral[Math.floor(Math.random()*neutral.length)])

				this.lastQuestion = this.getNextQuestionNumber(this.lastQuestion)

				if(this.lastQuestion = -1) {
					this.lastQuestion = this.getNextQuestionNumber(-1) // -1 should be connected to everything
				}

				this.sendMessage(questions[this.lastQuestion]["question"], 500)

				this.questionsAsked.add(this.lastQuestion)
				this.numQuestionsAsked += 1
			}
			
		}
	}

	/**
	 * Gets the number of another possible question but not one seen before
	 * @param num the number of the previous question
	 */
	getNextQuestionNumber(num) {
		const nextNums = questions[num]["next"]
		let nextPossible = []

		for(num of nextNums) {
			if(!this.questionsAsked.has(num)) {
				nextPossible.push(num)
			}
		}

		if(nextPossible.length == 0) {
			return -1
		} else {
			return nextPossible[Math.floor(Math.random()*nextPossible.length)]
		}

	}

	/**
	 * Logs the message from the client with some metadata
	 * @param message string message to log
	 */
	logIncomingMessage(message) {
		var t = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
		var s = t + "|" + this.client.id + "|" + this.lastQuestion + "|" + message + "\n";
		fs.appendFile('txt/log.txt', s, function (err) {
		  if (err) throw err;
		});
	}

	/**
	 * Sends a message to the client and appends a prefix for the bot name
	 * @param message string of text to send
	 * @param delay number of milliseconds to delay this message
	 */
	sendMessage(message, delay) {
		let that = this;
		if(!delay) {
			delay = 0
		}
		setTimeout(function(){
			that.client.emit('chat', "Chakubot: " + message)
		}, delay);
	}
}

// exported and handles the direct interactions with the socket
const chat = function(client) {
	console.log("a user connected")
	let interviewer = new Interviewer(client)
	interviewer.logIncomingMessage("user connected")

	client.on('chat', function(message) {
		client.emit('chat', "You: " + message);

		// handle the message, but add a small delay for it to feel more natural
		setTimeout(function() {
			interviewer.handleMessage(message)
		}, 500)
		
	});

	client.on('disconnect', function(){
		console.log('user disconnected');
		interviewer.logIncomingMessage('user disconnected')
		interviewer = null;
	});
}


module.exports = chat