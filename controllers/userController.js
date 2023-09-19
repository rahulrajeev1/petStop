const userModel = require("../model/userModel");
const productModel = require("../model/productModel")
require("dotenv").config();
const twilio = require("twilio")
const otpModel = require("../model/otpModel");
const { render } = require("ejs");
const {twilioFunction} = require("../middleware/twilio")
const jwt = require('jsonwebtoken')



function createToken(userDetails, status){
    return jwt.sign({
        userDetails, 
        status
    }, process.env.JWT_KEY)
}

// function twilioFunction(){
//     const client = require("twilio")(process.env.ACCOUNTSID,process.env.AUTHTOKEN);
//     const randome = Math.floor(Math.random()*9000) +1000;
//      console.log(randome);
//      client.messages
// .create({
//   body : `your otp ${randome}`,
//   to : "+917306626990",
//   from:'+12545002775'
// }).then(() => {
//     // Return the generated OTP for further use (optional)
//     return randomOTP;
//   }).catch((error) => {
//     // Handle any errors that occur during sending
//     console.error("Error sending OTP:", error);
//     throw error;
//   });
// }



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
        console.log(req.body)
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
            // twilioFunction().then((otp) =>{
            //     saveUser(otp)
            // })

            // twilioFunction(randome);   //testing mean

        // function saveUser(otp){
        //     newUser.save().then(()=>{
            //     })
            // }
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
        const jwtToken = createToken(user, "logged");
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
        console.log(req.params.id)
        const product = await productModel.findOne({_id:productId})
        console.log(product);
        res.render("user/singleProduct",{product})
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
            console.log(req.userDetails._id +"inside get cart");
            const name = user.name;
            const cartItems = user.cart.items
            const cartCount = cartItems.length;
            const cartProductIds = cartItems.map(item => item.productId)  // return all product ids in items
            const cartProducts = await productModel.find({ _id : { $in: cartProductIds } }) // return all products only inside the cart
            const productPrice  = cartItems.reduce((total,element) =>total + (element.quantity * element.price), 0 );  // take single product total price 
            console.log(cartCount)
            let totalPrice  =0 ;
            for(let item of cartItems){
                totalPrice += (item.quantity * item.realPrice);
            }
            console.log(cartProducts)
            res.render("user/cartPage",{cartProducts,totalPrice})
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
            existingCartItems.Price = existingCartItems.quantity * productPrice;
        }else{
            const newCartItem = {
                productId :id,
                quantity:1,
                realPrice:product.Price,
                offer:product.Price
            }
            userData.cart.items.push(newCartItem);
        }
    
        await userData.save();
        console.log(userData);
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

exports.addNewAddress = async(req,res)=>{
    try {
        const userId = req.userDetails._id;
        const newAddress = req.body;  // assuming the new address data is sent in the request body
        const user = await userModel.findOne({_id:userId})
        user.address.push(newAddress);
        await user.save()
        res.json({message:"new address is added successfully"});

    } catch (error) {
        console.log(error.message)
    }
}