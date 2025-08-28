const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'babayemiayomide87@gmail.com',
    pass: 'sqhh dmuu wzja pgbe', // Use Gmail App Password
  },
});

exports.sendContactEmail = functions.firestore
  .document('contactMessages/{messageId}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const mailOptions = {
      from: 'babayemiayomide87@gmail.com',
      to: 'sqhh dmuu wzja pgbe',
      subject: `New Contact Message from ${data.name}`,
      text: `From: ${data.name} (${data.email})\nMessage: ${data.message}`,
    };

    return transporter.sendMail(mailOptions);
  });