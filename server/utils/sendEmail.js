const sgMail = require('@sendgrid/mail');

const sendEmail = async (to, subject, text, html) => {
    if (!process.env.SENDGRID_API_KEY) {
        console.log("SendGrid API Key missing. Email not sent.");
        return;
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from: process.env.EMAIL_FROM, // Verified sender
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent to: ' + to);
    } catch (error) {
        console.error('SendGrid Error:', error.response ? error.response.body : error);
    }
};

module.exports = sendEmail;