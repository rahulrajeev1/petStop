const router = require("express").Router();
const userController = require("../controllers/userController")
const {parser, isNotLogged, isAwaitingOtp,checkUserBlocked} = require('../middleware/authUser');
const { errorHandling } = require("../middleware/errorHandling");

router.use(parser);

router.get("/", parser,checkUserBlocked, userController.getUserHome)
router.get("/register", isNotLogged,  userController.register)
router.post("/user_register", isNotLogged, userController.regester_post)
router.post("/otp-registerValidation", isAwaitingOtp,userController.otpregisterValidation)
router.get('/get_otp_page', isAwaitingOtp,userController.get_otp_page)
router.get("/login",isNotLogged,userController.login_get)
router.post("/login",userController.login_post)
router.get("/singleViewProduct/:id",userController.getSingleProductview)
router.get("/userLogout",userController.userLogOut)

router.get("/cart",parser,checkUserBlocked,userController.cart_get)
router.post("/addToCart/:id", parser,userController.addToCart_post);
router.delete("/cartRemove/:id",parser,userController.removeCart)

router.get("/userProfile",userController.profilePageGet);
router.post("/addAddress",parser,userController.addNewAddress);
router.get("/editAddress/:id",userController.editAddress);
router.post("/editAddress/:id",userController.editAddress_Post)
router.post("/resetpassword",userController.resetPassword)
router.post("/otp-resetPassword",userController.resetPasswordOtp)
router.post("/setPassword",userController.settingPasswordPost)
router.get('/loginResetPassword',userController.loginResetPasswordGet)
router.post("/loginResetPasswordPost",userController.loginResetPasswordPost);

router.get("/checkOutPage",userController.checkOutPage);
router.get("/orderPage",userController.orderPageView);
router.post("/updateCart",userController.updateCart);
router.post("/orderPost",userController.orderPost);
router.post("/orderStatus/:id",userController.orderStatus);
router.post("/orderCancel/:id",userController.orderCancel)
router.post("/singleProductCheckOut/:id",userController.singleProductBuyCheckOut)
router.post("/singleOrderPost/:id",userController.singleProductOrderPost)
router.post("/proflieEdit",userController.updateProfilePost)
router.get("/proflieEdit",userController.updateProfileGet)
router.post("/success/:id",userController.success)
router.post("/successCart",userController.successCart)
//wallet
router.get("/wallet",userController.walletGet)

router.get("/products",userController.producteDetails)
router.get("/productFilter/:id",userController.productFilter)
router.get("/productGetFiltering/:category/:value",userController.productValue)
router.post("/orderReturn/:id",userController.productReturn)

// wishlist

router.post("/addToWishlist/:id",userController.addToWhishlist)
router.get("/wishlist",userController.getWhislist);
router.post("/removeFormWishlist/:id",userController.deleteFromwhislist);

//coupon

router.post("/couponAdd",userController.addCoupon)


router.use(errorHandling);

module.exports = router;

