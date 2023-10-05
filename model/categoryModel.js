const { text } = require('express');
const mongoose = require('mongoose');     // Erase if already required

let categorySchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true,
    },
    discription:{
        type:String,
    },
    discount:{
        type:Number
    },
    isavilable:{
        type:Boolean,
        default:true
       }
         
});

//Export the model
// module.exports = mongoose.model('User', userSchema);



categorySchema.statics.getAllCategory  = async function(){
    const categoryList = await this.find();
    return categoryList;
}


module.exports = mongoose.model('Category',categorySchema)