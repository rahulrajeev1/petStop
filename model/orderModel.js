const mongoose = require("mongoose");
const userModel = require('./userModel');
const productModel = require('./productModel')


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel
    },
    status: {
        type: String,
        default: "Processing"
    },
    orderCancleRequest: {
        type: Boolean,
        default: false
    },
    orderReturnRequest: {
        type: Boolean,
        default: false
    },
    products: [{ 
        p_name: {
            type: String,
            require: true
        },
        realPrice: {
            type: String,
            require: true
        },
        price: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        image: [{
            type: String,
            require: true
        }],
        category: [{
            type: String,
            require: true
        }],
        quantity: {
            type: String,
            require: true
        },
    }],
    payment: {
        method: {
            type: String,
        },
        amount: {
            type: String,
        },
        orderId :{
            type:String,
        },
        discount:{
            type:Number,
        },
        coupon:{
            type:String
        }
    },
    proCartDetail: {
        type: Array
    },
    cartProduct: {
        type: Array
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    expectedDelivery: {
        type: Date,
    }
});

module.exports = mongoose.model('order', orderSchema);