var fs = require('fs');
var analyzer = require('./analyzer')

// LOAD initial data
questionData = {"-1": {"next": [], "questions": [], "topic": "none"}}
neutal = []
cuss = new Set();

function populateQuestions(s) {
	lines = s.split("\n")
	for(let line of lines) {
		info = line.split("|")
		index = info[0]
		nextNodes = info[1].split(",")
		topic = info[2]
		qs = info.slice(3) // gets all of them after and including 3
		questionData[index] = {"next": nextNodes, "questions": qs}
		questionData[-1]["next"].push([index])
	}
}

function selectQuestion(i) {
	questions = questionData[i]["questions"]
}

fs.readFile('txt/questions.txt', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	populateQuestions(data);
});

fs.readFile('txt/neutral.txt', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	neutral = data.split("\n");
});

fs.readFile('txt/cuss.txt', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	cuss = new Set(data.split("\n"));
});

/**
 * Finds out if the message has an English cuss word
 * @param message to find cuss words in
 * @return true if there is a cuss word
 */
function containsCussWord(message) {
	const words = message.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").split(" ");
	let hasWord = false;

	for(let word of words) {
		if(cuss.has(word)) {
			hasWord = true;
		}
	}

	return hasWord
}

function isYes(message) {
	const yesWords = ["yes", "yeah", "of course", "mhm", "sure"];
	let yes = false;

	for(let word of yesWords) {
		if(message.includes(word)) {
			yes = true;
		}
	}

	return yes;
}

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

		// keep tally of mean things
		this.meanWordsSaid = 0;

		this.sendMessage("Hi! I'm Chakubot!");
		this.sendMessage("Are you ready for your interview to begin?");
		this.lastAskedWords = "Are you ready for your interview to begin?"
		// TODO message about general understanding
	}

	/**
	 * Gets a message from the client and dispatches a reply
	 * @param message text gotten from user
	 */
	handleMessage(message) {
		let that = this;
		this.logIncomingMessage(message);

		if(this.state === "finished") {
			return
		}

		message = message.toLowerCase()
		if(containsCussWord(message)) {
			this.handleBadWord();
		} else if(this.state === "beginning") {
			if(isYes(message)) {
				this.state = "question";
				this.sendMessage("Awesome! Let's start the interview!");

				// ask a first question
				question = selectQuestion(0)
				this.sendMessage(question, 300)
				this.lastQuestion = 0
				this.numQuestionsAsked += 1
				this.lastAskedWords = question
			} else { // TODO see if need a no and maybe Q/A?
				this.sendMessage("Okay! Take your time.");

				// delay 1.5 seconds before sending next message
				setTimeout(function(){
					if(that.state === "beginning")
						that.sendMessage("Now are you ready for the interview?");
				},1500);
			}
		} else if(this.state == "question") {
			// Gets the similarity score (TODO change number once have responses and use relevance score)
			analyzer.findSimilar(0, message, function(results) {
				that.totalScore += Number(results)
				that.numScores += 1
			})

			// handle advancing the question
			if(this.numQuestionsAsked >= this.maxNumQuestions) {
				this.sendMessage("Thank you for taking the time for this interview!")
				this.sendMessage("I will report this to upper management and they will get back to you shortly.", 200);
				this.botLeave()
				this.state = "finished"
				this.lastQuestion = -2

				// give a moment for the last similarity score to come in
				setTimeout(function(){
					console.log("The score is: ", that.totalScore/that.numScores)
				},1500);
			} else {
				// add filler sentences between questions
				this.sendMessage(neutral[Math.floor(Math.random()*neutral.length)]) // TODO check randomness

				this.lastQuestion = this.getNextQuestionNumber(this.lastQuestion)

				if(this.lastQuestion = -1) {
					this.lastQuestion = this.getNextQuestionNumber(-1) // -1 should be connected to everything
				}

				this.sendMessage(questionData[this.lastQuestion]["question"], 500)
				this.lastAskedWords = questionData[this.lastQuestion]["question"]

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
		const nextNums = questionData[num]["next"]
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

	/**
	 * Sends a message to the client dealing with the level of badness
	 */
	handleBadWord() {
		this.meanWordsSaid += 1;

		if(this.meanWordsSaid === 1) {
			this.sendMessage("Please watch your language. Thanks!")
		} else if(this.meanWordsSaid === 2) {
			this.sendMessage("I would appreciate it if you did not use words like that.")
		} else if(this.meanWordsSaid === 3) {
			this.sendMessage("Please act professional. That use of language is unacceptable.")
		} else if(this.meanWordsSaid === 4) {
			this.sendMessage("Do you kiss your mother with that mouth?!")
		} else if(this.meanWordsSaid >= 5) {
			this.botLeave()
			this.state = "finished"
		}

		// restate last question for the user
		if(this.meanWordsSaid < 5) {
			this.sendMessage(this.lastAskedWords, 300)
		}
	}

	/**
	 * Sends a message to the client saying Chakubot left the chatroom
	 */
	botLeave() {
		let that = this;
		setTimeout(function(){
			that.client.emit('chat', "[Chakubot left the chatroom]")
		}, 300);
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