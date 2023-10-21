

const jwt = require("jsonwebtoken")
const userModel = require("../model/userModel");

exports.parser = async function(req, res, next){
    if(req.cookies.userToken){
        const {userDetails, status} = await jwt.verify(req.cookies.userToken, process.env.JWT_KEY)
        req.userDetails = userDetails
        // console.log(JSON.stringify(req.userDetails)+"userDetails")
        req.status = status
    }
    next();
}
exports.checkUserBlocked= async(req, res, next)=> {

    if(req.cookies.userToken ){
        const {userDetails, status} = await jwt.verify(req.cookies.userToken, process.env.JWT_KEY)
        req.userDetails = userDetails
        req.status = status
    
        const user = await userModel.findOne({_id:req.userDetails._id}); // Assuming user data is attached to the request object during authentication
        console.log(req.userDetails._id)
            if ( user.isBlocked) {
                // User is blocked, clear the userToken cookie and redirect to the login page
                res.clearCookie('userToken');
                return res.redirect('/login');
            } 
        }
     next(); // Proceed to the next middleware or route handler

    // const user = req.user // Assuming user data is attached to the request object during authentication
    // console.log(req.userDetails._id)
    // if (user && user.isBlocked) {
    //     // User is blocked, clear the userToken cookie and redirect to the login page
    //     res.clearCookie('userToken');
    //     return res.redirect('/login');
    // } 
    // next(); // Proceed to the next middleware or route handler
}



exports.isNotLogged = async function(req, res, next){
    if(is_user_awaiting_otp(req)){
        return res.redirect('/get_otp_page');
    }
    else if(is_user_logged(req)){
        return res.redirect('/')
    }
    return next();
}

exports.isAwaitingOtp = async function(req, res, next){
    if( is_user_awaiting_otp(req)){
        return next();
    }
    else if( is_user_logged(req)){
        return res.redirect('/')
    }
    return res.redirect('/register')
}

exports.isLogged = async function(req, res, next){
    if( is_user_logged(req))
        return next();
    else if( is_user_awaiting_otp(req))
        return res.redirect('/get_otp_page')
    return res.redirect('/register')
}

function is_user_awaiting_otp({status}){
    if(status == "awaiting-otp") return true;
}

function is_user_logged({status}){
    if(status == "logged") return true;
}

