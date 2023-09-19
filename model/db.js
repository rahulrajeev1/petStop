require('dotenv').config()
const mongoose = require("mongoose");

const dbConnect =() =>{ 
    mongoose.connect("mongodb://127.0.0.1:27017/shopping")
    .then(()=>{ console.log("it is ranning fine")})
    .catch((e)=>{ console.log("error")});

}

// const user = require('../mode s/userCreate')
module.exports = dbConnect; 