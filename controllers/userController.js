const userModel = require("../model/userModel");
const productModel = require("../model/productModel")
require("dotenv").config();
const twilio = require("twilio")
const otpModel = require("../model/otpModel");
const { render, name, resolveInclude } = require("ejs");
const {twilioFunction} = require("../middleware/twilio")
const jwt = require('jsonwebtoken');
const express = require("express");
const orderModel = require("../model/orderModel")
const categoryModel = require("../model/categoryModel");
const { sendEmail } = require("../middleware/nodemailer");
const { NetworkContextImpl } = require("twilio/lib/rest/supersim/v1/network");
const Razorpay = require("razorpay")
const {KEYID,KEY_SECRET} = process.env


let  razorpayInstance = new Razorpay({
    key_id: KEYID,
    key_secret: KEY_SECRET,
  });

function createToken(userDetails, status){
    return jwt.sign({
        userDetails, 
        status
    }, process.env.JWT_KEY)
}




exports.getUserHome = async(req,res)=>{
    const product = await productModel.find().limit(5)
    const logined = req.userDetails;  // setting form middleware
    res.render("user/userPage.ejs",{product,logined})
}

exports.register = async(req,res)=>{
    res.render("user/register");
}


exports.regester_post = async(req,res)=>{
    try {
        const anyOne = await userModel.findOne({email:req.body.email});
        const entrie = 1;
        if(!anyOne){
           const user = await userModel.create({
               name: req.body.name, 
               email: req.body.email, 
               mobile: req.body.mobile, 
               password: req.body.password 
           });
           const randome = Math.floor(Math.random()*9000) +1000;

           const newOtp = await otpModel.create({
               number:randome,
           })
           console.log(newOtp);
           const jwtToken = createToken(user, "awaiting-otp") // creating jwt token (the function is declared above)  
           res.cookie("userToken", jwtToken)  // setting token in user cookie


            // twilioFunction(randome);   //testing mean

    
            console.log("here 2")
            res.redirect('/get_otp_page');
        }
        else{
            // error handling      
            res.render("user/register",{errorMessage: "There is already a account associated with the email"})
        }
    } catch (error) {
        console.log("error generation numb",error);
    }
}

exports.get_otp_page = async(req, res)=>{
    const entrie = 1;
    res.render("user/validation",{entrie});
}

exports.otpregisterValidation = async(req,res)=>{
    try {
        const num1 = req.body.num_1;
        const num2 = req.body.num_2;
        const num3 = req.body.num_3;
        const num4 = req.body.num_4;
        const code = parseInt( num1 + num2 + num3 + num4 );
        
        const foundOtp = await otpModel.findOneAndDelete({number:code});

        const {userDetails} = req
        console.log(userDetails)
        const userId = userDetails._id;
        console.log(userId)

        const updatedUser = await userModel.findByIdAndUpdate(userId, {$set: {isVerified: true}}, {new: true});
        console.log(updatedUser)
        const jwtToken = createToken(updatedUser, "logged");
        req.user = updatedUser;
        res.cookie("userToken", jwtToken)
        res.redirect('/')

        // console.log("enterd code"+code);

        // if(foundOtp){
        //     const succ = "Successfully Created Your Account";
        //     // await userModel.create()
        //     res.rediract("/")
        // }else{

        //     res.render("user/register",{fail: "Please Check Your OTP"})
        // }

    } catch (error) {
        console.log(error); 
        const message = error.message;
        res.status(500).render('404-error', { error, message });
    }
}

exports.login_get = (req,res)=>{
    res.render("user/login")
}

exports.login_post = async(req,res)=>{
    const { email, password }  = req.body;
    const findUser = await userModel.findOne({email}, {password: 1})
    console.log(findUser)

    const user = await userModel.findOne({email:email});

    
    // if(findUser &&  (await findUser.isPasswordMatched(password))){
    if(findUser && user.password === password ){
        
        if(user.isBlocked === true) return res.status(400).json({message:"it is blocked"})
        console.log("correct user entered")
        const userData = {
            _id:user._id,
            eamil:user.email
        }

        // change userDetails
        const jwtToken = createToken(userData, "logged");
        res.cookie("userToken", jwtToken)
        req.user = user;
         res.status(200).json({message:"Logined is successful"}) 
    }else{ 
        console.log("usernot")
         res.status(401).json({message:"entered value is not found",type: 'danger' })
        // res.redirect("/login")
    }
}

exports.getSingleProductview = async(req,res)=>{
    try {
        const productId = req.params.id;
        const product = await productModel.findOne({_id:productId})
        const logined = req.userDetails; 
        res.render("user/singleProduct",{product,logined})
    } catch (error) {
        console.log(error.message)
    }
}


exports.userLogOut =async(req,res)=>{
    
        res.clearCookie('userToken'); // Clear the adminToken cookie
        res.redirect('/admin/adminLogin'); // Redirect to the login page or any other desired destination
    
}


// cart 
exports.cart_get = async(req,res)=>{
    try {
        if(req.userDetails){ 
            const user = await userModel.findOne({_id:req.userDetails._id });
            const name = user.name;
            const cartItems = user.cart.items
            const cartCount = cartItems.length;
            const cartProductIds = cartItems.map(item => item.productId)  // return all product ids in items
            const cartProducts = await productModel.find({ _id : { $in: cartProductIds } }) // return all products only inside the cart
            const productPrice  = cartItems.reduce((total,element) => total + (element.quantity * element.price), 0 );  // take single product total price 
            let totalPrice  = 0 ;
            const cartPro = [... cartProducts]
            cartPro.forEach((obj) =>{            
                    for(let cart of cartItems){ 
                        if(obj._id.toString() === cart.productId.toString()){
                            obj.stoke = cart.quantity;    
                        }
                    }                
            })   
           
            for(let item of cartItems){
                totalPrice += (item.quantity * item.realPrice);
            }
            res.render("user/cartPage",{cartPro,totalPrice,cartItems})
        }else{
            res.redirect("/login");
        } 
    } catch (error) {
        console.log(error.message)
    }
} 

exports.addToCart_post= async (req,res)=>{
    try {
        const id = req.params.id;
        const userData = await userModel.findOne({_id:req.userDetails._id});
        const cartItems = userData.cart.items;
        const existingCartItems = cartItems.find((item)=> item.productId.toString() === id);
        
        const product = await productModel.findOne({_id:id});
        const productPrice = product.Price;
        
        if(existingCartItems){
            existingCartItems.quantity += 1;
            existingCartItems.realPrice = existingCartItems.quantity * productPrice;
            console.log( existingCartItems.price)
        }else{
            const newCartItem = {
                productId :id,
                quantity:1,
                realPrice:productPrice,
                offer:product.Price
            }
            userData.cart.items.push(newCartItem);
        }
    
        await userData.save();
        res.json('successfully  cart ur product')

    } catch (error) {

        console.log(error.message)
    }
   
}
exports.removeCart = async(req,res)=>{
    const itemId = req.params.id
    console.log(itemId)
    try {
        const user = await userModel.findOne({_id:req.userDetails._id})
        user.cart.items = user.cart.items.filter( item => item.productId != itemId); // not store the removed id and another are store
        await user.save()
        console.log(user.cart.items)
        console.log(user)
        res.json({message:'removed the item form the cart '})
    } catch (error) {
        console.log(error.message)
    }
}

exports.updateCart = async (req,res) =>{
    const user = await userModel.findOne({_id:req.userDetails._id});
    const cartItems = user.cart.items;
    const products = req.body;
    const cartProductIds = cartItems.map(item => item.productId.toString());    
    for(let value of cartItems){
        for(let pro of products){
            if(new String(value.productId).trim() === new String(pro.productId).trim()){
                console.log("insid")
                value.quantity = pro.productQuantity
            }
        }
    }
    await user.save();
    console.log(cartItems);
    res.status(200).json({message:"it working fine"})
}

exports.checkOutPage = async(req,res)=>{
    try{
        const userData = await userModel.findOne({_id:req.userDetails._id});
        const address = userData.address;
        const cartItems = userData.cart.items
        const cartProductIds = cartItems.map(item => item.productId)  // return all product ids in items
        const cartProducts = await productModel.find({ _id : { $in: cartProductIds } }) // return all products only inside the cart
       
        let totalPrice  = 0 ;
        
        for(let item of cartItems){
            totalPrice += (item.quantity * item.realPrice);
        }
        res.render("user/checkOutPage",{address,totalPrice})
    }catch(error){
        console.log(error.message)
    }
}

exports.resetPassword = async(req,res)=>{
    try {
        if(req.body.entrie === "true"){

            const randome = Math.floor(Math.random()*9000) +1000;
            const newOtp = await otpModel.create({
                number:randome,
            })
            await newOtp.save();
            sendEmail(newOtp);
            console.log(newOtp);
            const entrie = 2;
            req.body.entrie = "false";
        res.render("user/validation",{entrie});
        }else{
            res.redirect("/userProfile");
        }


    } catch (error) {
        console.log(error.message)
    }
}

exports.resetPasswordOtp = async(req,res)=>{
    try {
        const num1 = req.body.num_1;
        const num2 = req.body.num_2;
        const num3 = req.body.num_3;
        const num4 = req.body.num_4;
        const code = parseInt( num1 + num2 + num3 + num4 );
        const foundOtp = await otpModel.findOneAndDelete({number:code});
        console.log(code);
        if(code == foundOtp.number){
            res.render("user/reSetPassword")
        }else{
            res.redirect("/userProfile");
        }
    } catch (error) {
        
    }
}

exports.settingPasswordPost = async(req,res)=>{
    try {
        if(req.body.enter){
            const user = await userModel.findOne({_id:req.userDetails._id});
            const password = req.body.password
            user.password = password;
            await user.save()
            req.body.enter = false;
            res.redirect("/userProfile");
        }else{
            res.redirect("/userProfile")
        }
    } catch (error) {
        console.log(error.message);
    }
}



exports.profilePageGet = async(req,res)=>{
    try {
        const userData = await userModel.findOne({_id:req.userDetails._id});
        
        const address = userData.address;
        res.render("user/setting",{userData,address})
    } catch (error) {
        console.log(error.message)
    }
}

exports.updateProfileGet = async (req,res)=>{
    try {
        const data = await userModel.findOne({_id:req.userDetails._id});
        res.render("user/profileEdit",{data})
    } catch (error) {
        
    }
}

exports.updateProfilePost = async (req,res)=>{
    try {
        const email = req.body.email;
        const mobile = req.body.mobile;
        const Name = req.body.name;
        console.log(req.body);
        const user = await userModel.find({email:email});
        console.log(user)
        if(email == req.userDetails.email){

            await userModel.findByIdAndUpdate({_id:req.userDetails._id},{
                $set:{ 
                    email:email,
                    name:Name,
                    mobile:mobile,
                }
            })
            res.status(200).json({message:"all good "})
            
        }else{
            if(user.length > 0) return res.status(302).json({message: "email is already exists"})

            await userModel.findByIdAndUpdate({_id:req.userDetails._id},{
                $set:{ 
                    email:email,
                    name:Name,
                    mobile:mobile,
                }
            })
            res.status(200).json({message:"all good "})
        }
    } catch (error) {
        console.log(error.message)
    }
}

exports.addNewAddress = async(req,res)=>{
    try {
        const userId = req.userDetails._id;
        const newAddress = req.body;  // assuming the new address data is sent in the request body

        const user = await userModel.findOne({_id:userId})
        user.address.push(newAddress);
        await user.save()
        res.redirect("/userProfile");

    } catch (error) {
        console.log(error.message)
    }
}


exports.editAddress = async(req,res) =>{
    try {
        const userData = await userModel.findOne({_id:req.userDetails._id});
        const addressId = req.params.id;
        const address = userData.address.find((data) => data._id.toString() === addressId);
        res.render("user/editAddress",{address});
    } catch (error) {
        console.log(error.message)
    }
}

exports.editAddress_Post = async(req,res) => {
    try {
        const userData = await userModel.findOne({_id:req.userDetails._id});
        const addressId = req.params.id;
        const address = userData.address.find((data)=> data._id.toString() ===  addressId);
        address.name = req.body.name;
        address.city = req.body.city;
        address.houseName = req.body.houseName;
        address.state = req.body.state;
        address.postalCode = req.body.postalCode;
        address.street = req.body.street;
        address.phone = req.body.phone;

        await userData.save()
        res.redirect("/userProfile")

        
    } catch (error) {
        console.log(error.message)
    }
}


//order

 
exports.singleProductBuyCheckOut = async(req,res)=>{
    try {
        console.log(req.params.id)
        const userData = await userModel.findOne({_id:req.userDetails._id});
        const address = userData.address;
        const Product = await productModel.findOne({ _id : req.params.id }) // return all products only inside the cart
       
        let totalPrice  = Product.Price * req.body.quantity ;
        
        const Id = req.params.id;
        res.render("user/checkOutPage",{address,totalPrice, quantity : req.body.quantity,Id })
    } catch (error) {
        console.log(error.message)
    }
}

exports.success = async(req,res) =>{
    console.log("here in the success")
    try{
        const product = await productModel.findOne({_id:req.params.id});
        const currentDate = new Date();
        const user = await userModel.findOne({_id:req.userDetails._id});
        const amount = req.body.amount;
        const method = req.body.method;


        const addressId = req.body.address;
        const cartItems = [{
            productId :product._id,
            quantity:req.body.quantity,
            realPrice:product.Price,
            offer:product.Price
        }]
        const productData = [{
            name:product.Name,
            realPrice:product.Price,
            price:amount,
            description:product.discription,
            image:product.Image,
            category:product.Category,
            quantity:req.body.quantity,
        }];
        const deliveryDate = new Date();
        deliveryDate.setDate(currentDate.getDate() + 5);
        const orderProduct = new orderModel( {
            userId:req.userDetails._id,
            address:addressId,
            products:productData,
            payment:{
                method:method,
                amount:amount,
                orderId: req.body?.orderId ,
            },
            proCartDetail: product,
            cartProduct: cartItems,
            expectedDelivery: deliveryDate
        } )
        try {
            console.log(req.body)
            await orderProduct.save()
            product.quantity = product.quantity-req.body.quantity;
            await product.save();
            return res.status(200).json("added in the database");
        } catch (error) {
            console.log(error.message)
        }

    }catch(error){

    }
}

exports.singleProductOrderPost = async(req,res)=>{
    try {
        const product = await productModel.findOne({_id:req.params.id});
        const currentDate = new Date();
        const user = await userModel.findOne({_id:req.userDetails._id});
        const amount = req.body.amount;
        const method = req.body.method;
        const productName = product.Name;

        const addressId = req.body.address;
        const cartItems = [{
            productId :product._id,
            quantity:req.body.quantity,
            realPrice:product.Price,
            offer:product.Price
        }]
        const productData = [{
            name:product.Name,
            realPrice:product.Price,
            price:amount,
            description:product.discription,
            image:product.Image,
            category:product.Category,
            quantity:req.body.quantity,
        }];
        const deliveryDate = new Date();
        deliveryDate.setDate(currentDate.getDate() + 5);
        const orderProduct = new orderModel( {
            userId:req.userDetails._id,
            address:addressId,
            products:productData,
            payment:{
                method:method,
                amount:amount,
                orderId: req.body?.orderId ,
            },
            proCartDetail: product,
            cartProduct: cartItems,
            expectedDelivery: deliveryDate
        } )


        // if(req.body.interNet){
        //     try {
        //         console.log(req.body)
        //         await orderProduct.save()
        //         product.quantity = product.quantity-req.body.quantity;
        //         await product.save();
        //         return res.status(200).json("added in the database");
        //     } catch (error) {
        //         console.log(error.message)
        //     }
            
        // }

          if(method === "COD"){
            await orderProduct.save()

            product.quantity = product.quantity-req.body.quantity;
            await product.save();
            res.json("it ok");
          }else if(method === "InternetBanking"){

            const amount  = req.body.amount*100;
            const options = {
                amount:amount,
                currency:"INR",
                receipt:"rec1"
            }
             razorpayInstance.orders.create(options,(err,order)=>{
                 if(!err){
                     console.log(order.id)
                    res.status(200).send({
                        success:true,
                        msg:"order Created",
                        order_id:order.id,
                        amount:amount,
                        key_id:KEYID,
                        productName:productData.map( item => item.name),
                        discription:productData.map( item => item.description),
                        contact:"9946800267",
                        email:"rahul@gamil.com",
                        name:"rahul",
                        order:orderProduct, 
                    })
                }else{
                    console.log(err)
                }
            })

            
          }


    } catch (error) {
        console.log(error)
    }
}


exports.orderPost = async(req,res)=>{
    try{
        const currentDate = new Date();
        const user = await userModel.findOne({_id:req.userDetails._id});
        const cartItems = user.cart.items;
        const cartProductIds = cartItems.map(item => item.productId.toString());
        const cartProducts = await productModel.find({_id : { $in : cartProductIds}});
        const amount = req.body.amount;
        const method = req.body.method;
        const addressId = req.body.address;
        const productData = cartProducts.map(product =>({
            name:product.Name,
            realPrice:product.Price,
            price:amount,
            description:product.discription,
            image:product.Image,
            category:product.Category,
            quantity:product.quantity
        }));
        const deliveryDate = new Date();
        deliveryDate.setDate(currentDate.getDate() + 5);
        const orderProduct = new orderModel( {
            userId:req.userDetails._id,
            address:addressId,
            products:productData,
            payment:{
                method:method,
                amount:amount,
            },
            proCartDetail: cartProducts,
            cartProduct: cartItems,
            expectedDelivery: deliveryDate
        } )
          if(method === "COD"){
            await orderProduct.save()
            for(let values of cartItems){
                for(let product of cartProducts){
                    if(new String(values.productId).trim() === new String(product._id).trim()){
                        if(product.quantity == 0) return res.status(300).send({message:"out of stoke"})
                        product.quantity = product.quantity - values.quantity;
                        await product.save();
                    }
                }
            }
            user.cart.items = [];
            await user.save();
            res.send("it ok");
          }  
    }catch(error){
        console.log(error.message)
    }
}

exports.orderPageView = async (req,res)=>{
    try {
        const order = await orderModel.find({ userId:req.userDetails._id , orderReturnRequest: false, orderCancleRequest: false, status: { $ne: 'Deliverd' } }).sort({ _id: -1 });
        const orderHist = await orderModel.find({userId: req.userDetails._id,$or: [{ orderCancleRequest: true },{ status: 'Deliverd' }], orderReturnRequest: false, }).sort({ _id: -1 });
        const orderProduct = orderHist.map(data => data.products)
        
        const orderHistStatus = orderHist.map(data => data.orderCancleRequest);
        const orderHista = orderHist.map(data => data.status);
        
        const product = order.map(data => data.products);
        
        const newProduct = product.flat();

   
        const Date = order.map(data => data.expectedDelivery.toLocaleDateString());

       res.render("user/orders",{newProduct,order,Date, 
        orderHist,
        orderProduct,
        orderHistStatus,
        orderHista, }) 
    } catch (error) {
        console.log("in the order page")
        console.log(error.message)
    }
}


exports.orderStatus = async (req, res) => {
    try {
        
        const userDetails = await userModel.findOne({_id:req.userDetails._id });
        const cart = userDetails.cart.items;
        const cartCount = cart.length;
        const orderId = req.params.id;
        const order = await orderModel.find({ _id: orderId });
        const orderProducts = order.map(items => items.proCartDetail).flat();
        const cartProducts = order.map(items => items.cartProduct).flat();
        for (let i = 0; i < orderProducts.length; i++) {
            const orderProductId = orderProducts[i]._id;
            const matchingCartProduct = cartProducts.find(cartProduct => cartProduct.productId.toString() === orderProductId.toString());

            if (matchingCartProduct) {
                orderProducts[i].cartProduct = matchingCartProduct;
            }
        }
        const address = userDetails.address.find(items => items._id.toString() == order.map(items => items.address).toString());
        const subTotal = cartProducts.reduce((totals, items) => totals + items.realPrice, 0);
        const [orderCanceld] = order.map(item => item.orderCancleRequest);
        const orderStatus = order.map(item => item.status);
        res.render("user/orderstatus", { title: "Product view", cartCount, order, orderProducts, subTotal, address, orderCanceld, orderStatus })
    } catch (error) {
        console.log(error)
        const message = error.message
        res.render('404-error',{error,message})

    }
}

exports.orderCancel = async (req,res)=>{
try {
    const id  = req.params.id
    await orderModel.findByIdAndUpdate({_id:id},{
        $set: {
            orderCancleRequest: true
        }
    })
    const orderData  = await orderModel.findOne({_id:id});
    const orderPayment = orderData.payment;
    if(orderPayment.method === "InternetBanking"){
        const user = await userModel.findOne({_id:req.userDetails._id});
        const order = await orderModel.findOne({_id:id});
        const orderId = order.payment.orderId;

        // razorpayInstance.orders.cancel(orderId, (error, response) => {
        //     console.log("inide the rax")
        //     if(!error){
        //         console.log("it is removed")
        //     }else{
        //         console.log(error)
        //     }
        // })
        


        let val = user.balance;
        const balance = Number(orderPayment.amount) + val;

        const wallet = {
            date : new Date.now(),
            amount : balance,
            receipts : orderPayment.amount
        }
        user.wallet.push(wallet);
        user.balance = balance;
        await user.save();

        }
         res.redirect("/orderPage")
    } catch (error) {
         console.log(error.message);
    }
}


exports.walletGet = async (req,res) =>{
    try {
        const userData =  await userModel.findOne({_id:req.userDetails._id});
        const wallet = userData.wallet;
        res.render("user/wallet",{wallet});
    
    } catch (error) {
        console.log(error )
    }
}


// product 
exports.producteDetails = async (req,res)=>{
    try{
        const product = await productModel.find();
        res.render("user/productCollection",{product});
    }catch(error){

    }
}

exports.allProduct = async (req,res)=>{
    try {
        const product = await productModel.find();
        res.status(200).json(product);
    } catch (error) {
        console.log(error.message)
    }
}

exports.productFilter = async (req,res)=>{
    try {
        const item = req.params.id;
        console.log(item)
        
        if(item =="cat"){
            const cat = await categoryModel.findOne({name:item});
            const product = await productModel.find({Category:cat._id})
            res.json(product);
        }else if(item === "Dog"){
            const dog = await categoryModel.findOne({name:item});
            const product = await productModel.find({Category:dog._id});
            res.json(product)

        }else if(item === "bird"){
            const fish = await categoryModel.find({name:item});
            const product = await productModel.find({Category:fish._id})
            res.json(product);
        }else{
         const product = await productModel.find();
         res.json(product);
        }
    } catch (error) {
        console.log(error.message);
    }
}

exports.productValue = async (req,res)=>{
    try{
       const {value ,category}= req.params;
       console.log(value)
       console.log(category +"it is")
       const category1 = await categoryModel.findOne({name:category});
       if(category1){
            console.log(category1)
           if(value == "first"){
            const product = await productModel.find({
                Category:category1._id,
                Price:{$gt:0,$lte:1000}
            })
            res.json(product)
           }else if(value === "second"){
            const product = await productModel.find({
                Category:category1._id,
                Price:{$gt:1000,$lte:2000}
            })
            res.json(product)
           }else{
        const product = await productModel.find({
            Category:category1._id,
            Price:{$gt:2000}
        })
        res.json(product)
       }
    }else if (category === "all"){
           if(value == "first"){

            const product = await productModel.find({
                Price:{$gt:0,$lte:1000}
            })
            res.json(product)
           }else if(value === "second"){
            const product = await productModel.find({
                Price: { $gt: 1000, $lte: 2000 }
              });
            res.json(product)
           }else{
        const product = await productModel.find({
            Price:{$gt:2000}
        })
        res.json(product)
       }
    }
    }catch(error){
        console.log(error);
    }
}