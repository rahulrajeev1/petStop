const router = require("express").Router();
const userController = require("../controllers/userController")
const {parser, isNotLogged, isAwaitingOtp,checkUserBlocked} = require('../middleware/authUser')

router.use(parser);

router.get("/", parser,checkUserBlocked, userController.getUserHome)
router.get("/register", isNotLogged,  userController.register)
router.post("/user_register", isNotLogged, userController.regester_post)
router.post("/otp-registerValidation", isAwaitingOtp,userController.otpregisterValidation)
router.get('/get_otp_page', isAwaitingOtp,userController.get_otp_page)
router.get("/login",isNotLogged,userController.login_get)
router.post("/login",userController.login_post)
router.get("/singleViewProduct/:id",userController.getSingleProductview)

router.get("/cart",parser,checkUserBlocked,userController.cart_get)
router.post("/addToCart/:id", parser,userController.addToCart_post);
router.delete("/cartRemove/:id",parser,userController.removeCart)

router.get("/userSetting")
module.exports = router;

