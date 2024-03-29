var fs = require('fs');
var analyzer = require('./analyzer');
var db = require('./dbConnector');
var mailer = require('./mailer');

// LOAD initial data
questionData = {"-1": {"next": [], "questions": [], "topic": "none"}}
topics = {} // topic: [index, index, ...]
index2topic = {}
neutal = []
cuss = new Set();

/**
 * Reads in data from a file and parses out the questions
 * @param data string from reading the file
 */
function populateQuestions(data) {
	lines = data.split("\n")
	for(let line of lines) {
		info = line.split("|")
		index = info[0]
		nextNodes = info[1].split(",") 
		startingQuestion = false
		if(info[2] === '') {
			startingQuestion = true
		}

		topic = info[3]
		qs = info.slice(4) // gets all of them after and including 3
		questionData[index] = {"next": nextNodes, "questions": qs, "topic": topic, "canStart": startingQuestion}
		questionData[-1]["next"].push(index)

		if(topics.hasOwnProperty(topic)) {
			topics[topic].push(index)
		} else {
			topics[topic] = [index]
		}
	}

	// make reverse topic mapper
	for(let topic in topics) {
		for(let index of topics[topic]) {
			index2topic[index] = topic
		}
	}
}

// READ FILES

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

/**
 * Finds out if the message says yes in it
 * @param message to see if is yes
 * @return true if the question says yes
 */
function isYes(message) {
	const yesWords = ["yes", "yeah", "of course", "mhm", "sure", "fine", "okay", "yup", "yep"];
	let yes = false;

	for(let word of yesWords) {
		if(message.includes(word)) {
			yes = true;
		}
	}

	return yes && !isNo(message);
}

/**
 * Finds out if the message says no in it
 * @param message to see if is no
 * @return true if the question says no
 */
function isNo(message) {
	const noWords = ["no", "nope", "never", "of course not", "uh-uh", "nah", "nay", "negative", "not in a million years", 'fat chance'];
	let no = false;

	for(let word of noWords) {
		if(message.includes(word)) {
			no = true;
		}
	}

	return no;
}

/**
 * Selects a question with the given id. Randomizes if multiple
 * @param id the id of the question
 * @return string question
 */
function selectQuestion(id) {
	questions = questionData[id]["questions"]
	return questions[Math.floor(Math.random()*questions.length)]
}

/**
 * Extracts the company name from the message text
 * @param text the message to extract the name from
 * @return string of the company name
 */
function extractCompanyName(text) {
	let lowerText = text.toLowerCase()
	const stopWords = ["my", "is", "the", ".", "it"]

	for(let word of stopWords) {
		lowerText = lowerText.replace(word, "")
	}

	let words = lowerText.split(" ").filter(function(word){ return word.length > 0; })

	if(words[0] === "company") {
		words = words.slice(1,words.length)
	}

	words = words.map(function(word){return word[0].toUpperCase() + word.substring(1); })

	return words.join(" ")
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
		this.lastQuestionNumber = -1; // number of last question asked
		this.numQuestionsAsked = 0;
		this.maxNumQuestions = 10;
		this.questionsAsked = new Set()
		this.companyId = client.request.session.companyId
		this.specialQuestionNumbers = new Set([0, 34])
		// TODO query company name from database

		// special things

		// set up topic tallies
		this.topicTallies = {}
		for(let topic in topics) {
			this.topicTallies[topic] = 0;
		}

		// rolling average of similarity score
		this.totalScore = 0;
		this.numScores = 0;

		// keep tally of mean things
		this.meanWordsSaid = 0;

		this.sendMessage("Hi! I'm Chakubot!");
		this.sendMessage("I will be asking you around " + this.maxNumQuestions + " questions.");
		this.sendMessage("Are you ready for your interview to begin?");
		this.lastAskedWords = "Are you ready for your interview to begin?"
		this.logIndex = 0
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
				const question = selectQuestion(0)
				this.sendMessage(question, 300)
				this.incrementTopicTally(0)
				this.questionsAsked.add(0);
				this.lastQuestionNumber = 0
				this.numQuestionsAsked += 1
				this.lastAskedWords = question
			} else if(isNo(message)) { // TODO see if need a no and maybe Q/A?
				this.sendMessage("Okay! Take your time.");

				// delay 1.5 seconds before sending next message
				setTimeout(function(){
					if(that.state === "beginning")
						that.sendMessage("Now are you ready for the interview?");
				},1500);
			} else {
				this.sendMessage("I'm not sure if you understood what I said.");
				this.sendMessage("I will be asking you around " + this.maxNumQuestions + " questions to see if I think your idea is something we would like to invest in.");
				this.sendMessage("Are you ready for your interview to begin?");
			}
		} else if(this.state == "question" || this.state == "ending") {
			// Gets the similarity score (TODO change number once have responses and use relevance score)
			analyzer.findSimilar(0, message, function(results) {
				that.totalScore += Number(results)
				that.numScores += 1
			})

			// handle some questions differently
			let changedQuestion = false; // handles if a new question was asked in this flow
			if(this.specialQuestionNumbers.has(this.lastQuestionNumber)) {
				// handle special question numbers
				if(this.lastQuestionNumber === 0) {
					this.companyName = extractCompanyName(message)
				} else if(this.lastQuestionNumber === 34) {
					// assumes just sends email
					this.companyEmail = message
					let data = {"interview_company_name": this.companyName,
								"interview_email": this.companyEmail,
								"interview_id": this.client.id, "company_id": this.companyId}
					db.addInterview(data, function(result){})
				}
			}

			// handle advancing the question
			if(this.numQuestionsAsked >= this.maxNumQuestions && !changedQuestion & this.state !== "ending") {
				this.state = "ending"
				this.lastQuestionNumber = 34
				const question = selectQuestion(34)
				this.sendMessage(question, 300)
			} else if(this.state === "ending") {
				this.sendMessage("Thank you for taking the time for this interview!")
				this.sendMessage("I will report this to upper management and they will get back to you shortly.", 400);
				setTimeout(function(){ that.botLeave(); }, 700);
				this.state = "finished"
				this.lastQuestionNumber = -2
				this.finishConversation(); // TODO move after score calculated

				// give a moment for the last similarity score to come in
				setTimeout(function(){
					console.log("The score is: ", that.totalScore/that.numScores)
				},1500);
			} else if(!changedQuestion) {
				// add filler sentences between questions
				this.sendMessage(neutral[Math.floor(Math.random()*neutral.length)]) // TODO check randomness

				this.lastQuestionNumber = this.getNextQuestionNumber(this.lastQuestionNumber)

				if(this.lastQuestionNumber = -1) {
					this.lastQuestionNumber = this.getNextQuestionNumber(-1) // -1 should be connected to everything
				}
				const question = selectQuestion(this.lastQuestionNumber)
				this.sendMessage(question, 500)
				this.incrementTopicTally(this.lastQuestionNumber)
				this.lastAskedWords = question

				this.questionsAsked.add(this.lastQuestionNumber)
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
		const oldTopic = questionData[num]["topic"]
		let nextPossible = []

		for(let num of nextNums) {
			if(!this.questionsAsked.has(num) && !isNaN(num)) {
				nextPossible.push(num)
			}
		}
		// has the next possible in the same category at this point

		// if no more possible questions, too many questions in this topic, or randomly chosen to move
		if(nextPossible.length == 0 || this.topicTallies[oldTopic] >= 3 || Math.random() < 0.15) {
			// find new topic
			const newTopic = this.chooseNewTopic()

			if(newTopic == -1) {
				return -1
			} else {
				nextPossible = [];

				for(let num of topics[newTopic]) {
					if(!this.questionsAsked.has(num) && !questionData[num]["canStart"]) {
						nextPossible.push(num)
					}
				}

				return nextPossible[Math.floor(Math.random()*nextPossible.length)]
			}
		} else {
			return nextPossible[Math.floor(Math.random()*nextPossible.length)]
		}

	}

	/**
	 * Increments the topic tally for the question with id num
	 * @param num the number of the new question
	 */
	incrementTopicTally(num) {
		this.topicTallies[questionData[num]["topic"]] += 1
	}

	/**
	 * Increments the topic tally for the question with id num
	 * @param num the number of the new question
	 */
	chooseNewTopic() {
		let possibleTopics = []

		for(let topic in this.topicTallies) {
			if(this.topicTallies[topic] < 3) {
				possibleTopics.push(topic)
			}
		}

		if(possibleTopics.length == 0) {
			return -1
		}

		return possibleTopics[Math.floor(Math.random()*possibleTopics.length)]
	}

	/**
	 * Logs the message from the client with some metadata
	 * @param message string message to log
	 */
	logIncomingMessage(message) {
		let messageJSON = {"message": message, "question_id": this.lastQuestionNumber, "company_id": this.companyId, "interview_id": this.client.id, "from_client": true, "log_index": this.logIndex}
		db.insertLog(messageJSON);
		this.logIndex += 1
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
			let messageJSON = {"message": message, "question_id": that.lastQuestionNumber, "company_id": that.companyId, "interview_id": that.client.id, "from_client": false, "log_index": that.logIndex}
			db.insertLog(messageJSON);
			that.logIndex += 1
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
			that.client.emit('chat', "[Chakubot left the chatroom]");
			// that.finishConversation();
		}, 300);
	}

	/**
	 * Emails report to company depending on settings
	 */
	finishConversation() {
		const id = this.client.id
		const name = this.companyName
		// sends email to company if the setting is set
		db.getEmailsFromCompanyId(this.companyId, function(emails) {
			mailer.interviewEmail(emails, id, name)
		})
	}
}

funcs = {}

// exported and handles the direct interactions with the socket
funcs.chat = function(client) {
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
		// interviewer.finishConversation();
		interviewer.logIncomingMessage('user disconnected')
		interviewer = null;
	});
}

// returns a map mapping question indices to the corresponding topic
funcs.topicMap = function() {
	return index2topic;
}


module.exports = funcs