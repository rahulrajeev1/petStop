require('dotenv').config()
const mongoose = require("mongoose");

const dbConnect =() =>{ 
    mongoose.connect(process.env.DB_URL)
    .then(()=>{ console.log("it is ranning fine")})
    .catch((e)=>{ console.log("error")});

}

// const user = require('../mode s/userCreate')
module.exports = dbConnect; 