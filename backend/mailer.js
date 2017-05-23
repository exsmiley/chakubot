const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chakubothelper@gmail.com',
        pass: 'PlzhELpME8'
    }
});

funcs = {}

funcs.interviewEmail = function(emails, interviewId) {
	interviewHTML = `
		<h2>New interview has been conducted!</h2>
		<p>You can see the report <a href="ec2-52-91-97-175.compute-1.amazonaws.com/report/` + interviewId + `">here</a>!</p>
		<p>Thanks,</p>
		<p>Chakubot</p>
	`

	// setup email data with unicode symbols
	let mailOptions = {
	    from: '"Chakubot" <chakubothelper@gmail.com>', // sender address
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
	    // console.log('Message %s sent: %s', info.messageId, info.response);
	});
}

module.exports = funcs;
