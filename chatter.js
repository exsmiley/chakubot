fs = require('fs');

data = {}

function populate_data(s) {
	lines = s.split("\n")
	for(line of lines) {
		info = line.split("|")
		nextNodes = info[1].split(",")
		data[info[0]] = {"next": nextNodes, "question": info[2]}
	}
}

fs.readFile('questions.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  populate_data(data);
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
		this.lastQuestion = -1;
		this.numQuestionsAsked = 0;
		this.sendMessage("Hi! I'm Chakubot!");
		this.sendMessage("Are you ready for your interview to begin?");
		console.log(data)
	}

	/**
	 * Gets a message from the client and dispatches a reply
	 * @param message text gotten from user
	 */
	handleMessage(message) {
		let that = this;
		if(this.state === "beginning") {
			if(message.includes("yes")) {
				this.state = "question";
				this.sendMessage("Okay! Let's start the interview!");

				// TODO ask a first question
				this.sendMessage(data[0]["question"])
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
			// TODO send to get the similarity score
			const nextPossible = data[this.lastQuestion]["next"]
			const nextQ = nextPossible[Math.floor(Math.random()*nextPossible.length)]

			this.sendMessage(data[nextQ]["question"])
			this.lastQuestion = nextQ
			this.numQuestionsAsked += 1
		}
	}

	/**
	 * Sends a message to the client and appends a prefix for the bot name
	 * @param message string of text to send
	 * @param delay number of milliseconds to delay this message
	 */
	sendMessage(message, delay=0) {
		let that = this;
		setTimeout(function(){
			that.client.emit('chat', "Chakubot: " + message)
		}, delay);
	}
}

// exported and handles the direct interactions with the socket
const chat = function(client) {
	console.log("a user connected")
	let interviewer = new Interviewer(client)

	client.on('chat', function(message) {
		client.emit('chat', "You: " + message);

		// handle the message, but add a small delay for it to feel more natural
		setTimeout(function() {
			interviewer.handleMessage(message)
		}, 500)
		
	});

	client.on('disconnect', function(){
		console.log('user disconnected');
		interviewer = null;
	});
}


module.exports = chat