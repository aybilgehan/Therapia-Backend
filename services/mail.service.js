const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.mailSender = async (mailOptions) => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return error;
        } else {
            return info;
        }
    });
}

module.exports = transporter;