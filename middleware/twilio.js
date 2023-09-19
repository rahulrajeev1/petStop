require("dotenv").config();


exports.twilioFunction = function(randomOTP){
    const client = require("twilio")(process.env.ACCOUNTSID,process.env.AUTHTOKEN);
    // const randomOTP = Math.floor(Math.random()*9000) +1000;
     console.log(randomOTP);
     client.messages
    .create({
    body : `your otp ${randomOTP}`,
    to : "+917306626990",
    from:'+12545002775'
    }).then(() => {
        // Return the generated OTP for further use (optional)
        return randomOTP;
    }).catch((error) => {
        // Handle any errors that occur during sending
        console.error("Error sending OTP:", error);
        throw error;
    });
}

