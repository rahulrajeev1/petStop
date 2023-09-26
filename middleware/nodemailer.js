
// const nodemailer = require("nodemailer");
// require("dotenv").config()

// const sendEmail = async (data) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.MAIL_ID,
//       pass: process.env.MAIL_PASS,
//     },
    
//   });

//   // Define email data using the provided data object
//   const emailData = {
//       from: "tryeit3@gmail.com", // Recipient address
//     to: "rajeevrahul110@gmail.com", // Sender address
//     subject: "Hello from Nodemailer", // Subject line
//     text: "This is a test email sent using Nodemailer.", // Plain text body
//     html: "<b>1234</b>", // HTML body
//   };

//   console.log("Preview sent: %s", emailData.subject);

//   try {
//     // Send the email
//     const info = await transporter.sendMail(emailData);
//     console.log('Email sent:', info.response);
//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // Re-throw the error for handling in the calling function or route
//   }
// };

// // Example of how to use the sendEmail function
// const data = {
//   subject: "Hello from Nodemailer",
//   text: "This is a test email sent using Nodemailer.",
// };

// // Call the sendEmail function with the data object
// sendEmail(data)
//   .then(() => {
//     // Handle success if needed
//   })
//   .catch((error) => {
//     // Handle errors if needed
//   });




const nodemailer = require("nodemailer");
require("dotenv").config()

exports.sendEmail = async (randomOTP) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS,
    },
    
  });

  // Define email data using the provided data object
  const emailData = {
      from: "tryeit3@gmail.com", // Recipient address
    to: "rajeevrahul110@gmail.com", // Sender address
    subject: "Hello from Nodemailer", // Subject line
    text: "This is a test email sent using Nodemailer.", // Plain text body
    html: `<b>${randomOTP}</b>`, // HTML body
  };

  console.log("Preview sent: %s", emailData.subject);

  try {
    // Send the email
    const info = await transporter.sendMail(emailData);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error for handling in the calling function or route
  }
};





