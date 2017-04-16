
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
		this.sendMessage("Hi! I'm Chakubot!");
		this.sendMessage("Are you ready for your interview to begin?");
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
			} else {
				this.sendMessage("Lameeeeeeeee!");

				// delay 1.5 seconds before sending next message
				setTimeout(function(){
					if(that.state === "beginning")
						that.sendMessage("Now are you ready for the interview?");
				},1500);
			}
		} else if(this.state == "question") {
			// TODO
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