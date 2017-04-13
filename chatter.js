
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
		this.client.emit('chat', "Chakubot: Hi! I'm Chakubot!");
		this.client.emit('chat', "Chakubot: Are you ready for your interview to begin?");
	}

	// gets a message and dispatches a reply
	handleMessage(message) {
		var that = this;
		if(this.state === "beginning") {
			if(message.includes("yes")) {
				this.state = "question";
				this.client.emit('chat', "Chakubot: Okay! Let's start the interview!");
			} else {
				this.client.emit('chat', "Chakubot: Lameeeeeeeee!");

				// delay 1.5 seconds before sending next message
				setTimeout(function(){
					if(that.state === "beginning")
						that.client.emit('chat', "Chakubot: Are you ready for the interview yet?");
				},1500);
			}
		} else if(this.state == "question") {

		}
	}
}


var chat = function(client) {
	console.log("a user connected")
	var interviewer = new Interviewer(client)

	client.on('chat', function(message) {
		client.emit('chat', "You: " + message);

		// handle the message, but add a small delay for it to feel more natural
		setTimeout(function() {
			interviewer.handleMessage(message)
		}, 500)
		
	})
}


module.exports = chat