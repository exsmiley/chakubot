let nodemailer = require('nodemailer');
let aws = require('aws-sdk');

// configure AWS SDK
aws.config.loadFromPath('../secrets/config.json');

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01' // I think this might actually be the latest version so yay?
    }),
    sendingRate: 1 // max 1 messages/second
});

funcs = {}

funcs.interviewEmail = function(emails, interviewId) {
	interviewHTML = `
		<h2>New interview has been conducted!</h2>
		<p>You can see the report <a href="chakubot.com/report/` + interviewId + `">here</a>!</p>
		<p>Thanks,</p>
		<p>Chakubot</p>
	`

	// setup email data with unicode symbols
	let mailOptions = {
	    from: '"Chakubot" <interviewer@chakubot.com>', // sender address
	    to: emails, // list of receivers
	    subject: 'New interview conducted', // Subject line
	    // text: 'Hello world ?', // plain text body
	    html: interviewHTML // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	        return console.log(error);
	    }
	    console.log('Message %s sent: %s', info.messageId, info.response);
	});
}

module.exports = funcs;
