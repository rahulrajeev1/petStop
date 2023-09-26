const router = require("express").Router();
const multer = require("multer");
const adminController = require("../controllers/adminController");
const { store } = require("../middleware/multer");
const { authenticateAdmin, checkAdminLoggedIn } = require("../middleware/authAdmin");

router.get("/home",authenticateAdmin,adminController.adminHome)
router.get("/adminLogin", checkAdminLoggedIn,adminController.get_adminLogin)
router.post("/adminLogin",adminController.post_adminLogin)


router.get("/category",authenticateAdmin,adminController.get_category);
router.post("/addCategory",adminController.post_addCategory); 
router.get("/addCategory",authenticateAdmin,adminController.get_addCategory);
router.get("/editCategory/:id",authenticateAdmin,adminController.get_editCategory);
router.post("/editCategory/:id",adminController.post_editCategory);
router.post("/searchCategory",adminController.post_searchCategory)

router.get("/addProduct",authenticateAdmin,adminController.addProduct); 
router.post("/addProduct",store.array("image",5),adminController.post_addProduct); 
router.post("/productSearch",adminController.productSearch_post)
router.get("/productEdit/:id",authenticateAdmin,adminController.get_productEdit)
router.post("/productEdit",store.array("image",5),adminController.post_productEdit)
router.get("/productView",authenticateAdmin,adminController.ProductTableView);
router.get("/deleteProduct/:id",authenticateAdmin,adminController.productDelete)

router.get("/addUser",authenticateAdmin,adminController.createUser_get);
router.post("/addUser",adminController.createUser_post);
router.get("/userView",authenticateAdmin,adminController.userTableView)
router.post('/user-unblocking/:id',adminController.userUnblock)
router.post('/user-blocking/:id',adminController.userBlock)
router.get("/editUser/:id",authenticateAdmin,adminController.editUser_get)
router.post("/editUser/:id",adminController.editUser_post)
router.post("/searchUser",adminController.userSearch)


router.get("/order",adminController.orderList)
router.post("/orderInformartion",adminController.orderDetails)

module.exports = router;

