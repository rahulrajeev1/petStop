
const mongoose = require('mongoose'); 

const productSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
       
    },
    Price:{
        type:Number,
        required:true,
        
    },
    Image:[{
        type:String,
        // required:true,
    }],



    Category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },
    brand:{
        type:String,
    },

    discription:{
        type:String,
        required:true,
    },

 
    hide : {
        type:Boolean,
        default:false,
    },
    InStock:{
        type:Boolean,
        default:true,
    },
    // sold:{
    //     type:Number,
    //     default:0,
    // },
    quantity:{
        type:Number,
        min:0,
        max:225,
    },
    rating:{
        type:Number,
        min:2,
        max:10,
        
    }

});

//Export the model
// module.exports = mongoose.model('User', userSchema);



productSchema.statics.getAllProducts  = async function(){
    const productList = await this.find().populate('Category');
    return productList;
}



module.exports = mongoose.model('Product',productSchema)