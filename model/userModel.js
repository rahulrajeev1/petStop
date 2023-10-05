const mongoose = require('mongoose'); 
const bcrypt = require("bcrypt");

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true, 
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:false,
    },
    password:{
        type:String,
        required:true,
    },

    address: [{
        name: {
            type: String,
            required: true
        },
        houseName: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        }
    }],
    wishlist:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    }],
    balance:{
        type:Number,
        default:0
    },
    role: {
        type:String,
        default:"user"
    },

    isBlocked : {
        type:Boolean,
        default:false,
    },
    refreshToken:{
        type:String
    },
    isVerified: {
        type: Boolean, 
        default: false
    },
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            }, 
            realPrice: {
                type: Number,
            },
            price: {
                type: Number,
            },
            offer: {
                type: Number,
            }
        }]
    },
    wallet:[{
        date:{
            type: Date,
            // default: Date.now
        },
        receipts:{
            type: Number,
            
        },
        payments:{
            type:Number,
        },
        amount:{
            type:Number,
            required:true
        }
    }],

});

//Export the model
// module.exports = mongoose.model('User', userSchema);



// userSchema.pre("save",async function(next){
//     const salt = await bcrypt.genSaltSync(10);
//     this.password = await bcrypt.hash(this.password,10)
// })

// userSchema.methods.isPasswordMatched = async function(enteredPassword){
//     console.log("entered password"+ this.password)
//     return await bcrypt.compare(enteredPassword,this.password);
// }

userSchema.statics.getAllUsers  = async function(){
    const userList = await this.find();
    return userList;
}


module.exports = mongoose.model('Users',userSchema)