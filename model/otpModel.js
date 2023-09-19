const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    number:{
        type:Number,
        required:true
    },
    createdAT:{
        type:Date,
        default:Date.now,
        index:{expires:60}
    }
})

module.exports = mongoose.model("OTP",otpSchema);