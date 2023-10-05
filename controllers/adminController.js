const UserModel = require("../model/userModel")
const productModel = require("../model/productModel")
const CategoryModel = require("../model/categoryModel")
const fs = require('fs');
const express = require("express");
const categoryModel = require("../model/categoryModel");
const jwt = require('jsonwebtoken');
const { resolve } = require("path");
const userModel = require("../model/userModel");
const { CompositionContextImpl } = require("twilio/lib/rest/video/v1/composition");
const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel")


function createToken(email, status){
    return jwt.sign({
        email, 
        status
        
    }, process.env.JWT_KEY)
}

exports.get_adminLogin = async(req,res)=>{
    try {
        res.render("admin/adminLogin")
    } catch (error) {
        
    }
}
exports.post_adminLogin = async(req,res)=>{
    try {
        const PASS = "admin123";
        const  EMAIL= "admin@gmail.com"
        console.log(req.body)
        const {password,email} = req.body;
        console.log(password,email);
        if(PASS === password && EMAIL === email){
            console.log("inside")
            const jwtToken = createToken(email,"anything") // creating jwt token (the function is declared above)  
            res.cookie("adminToken", jwtToken)
            res.render("admin/adminHome")
        }
        res.redirect("/admin/adminLogin")

    } catch (error) {
        console.log(error.message)
    }
}
exports.adminHome = async (req,res)=>{
    res.render("admin/adminHome")
}

exports.adminLogout = (req,res)=>{
    res.clearCookie('adminToken'); // Clear the adminToken cookie
    res.redirect("/admin/adminLogin");
}

exports.addProduct = async(req,res)=>{
    const cateData = await categoryModel.find();
    res.render('admin/addProduct',{cateData});
}

exports.post_addProduct = async (req, res) => {
    console.log(req.body)
    try {
        if (req.body.Price < 0) {
            return res.status(400).send("Price is less than 0");
        }

        // console.log(req.body);
        const categoryId = req.body.Category;
        
        
        // res.send(findCategory._id)
        const product = new productModel({
            Name: req.body.name,
            Price: req.body.Price,
            Image: req.files.map(file => file.filename),
            Category: categoryId,  
            brand: req.body.brand.trim(),
            discription: req.body.discription.trim(),
            rating: req.body.rating,
            quantity: req.body.quantity,
        });

        await product.save();
        res.status(302).redirect("/admin/home");
    } catch (error) {
        // console.error(error);
        res.status(500).send(error);
    }
}; 

const productPerPage =7;
exports.ProductTableView = async(req,res)=>{
    try {
        console.log(req.url);
        console.log(req.params);

        const page = parseInt(req.query.page) || 1;   // get the page number from the qurey paremeter
        const skip = (page-1) * productPerPage;
        const totalProduct = await productModel.find().count()
        const totalPages = Math.ceil(totalProduct/productPerPage);

        const allProduct = await productModel.find().skip(skip).limit(productPerPage).populate('Category')
        // const allProduct = await productModel.find().populate('Category');
        res.render('admin/productViews',{allProduct,totalPages,currentPage:page})
    } catch (error) {
        console.log(error.message)
    }
    
}

exports.get_productEdit = async(req,res)=>{
    console.log(req.params)
    const product = await productModel.findOne({_id:req.params.id})
    const cateData = await  CategoryModel.find()
    
    res.render("admin/UpdateProduct",{product,cateData})
}

exports.post_productEdit =  async(req,res)=>{
    try {

        const id = req.body.id;
        const category = await CategoryModel.findOne({_id:req.body.Category})
        const existingProduct = await productModel.findById(id);
        const existingImg = existingProduct.Image;
        console.log(req.body.imagesToDelete)
        
        const deletImage = req.body.imagesToDelete || [];
        const imageToKeep = existingImg.filter( (img)=> !deletImage.includes(img));
        console.log(imageToKeep)

        
        //Deleting the unwanted img
        
        existingImg.forEach((filename) => {
            if (!imageToKeep.includes(filename)) {
                fs.unlink(`productsImg/${filename}`, (err) => {
                    if (err) {
                        console.log(err.message + " error in the edit image");
                    }
                });
            }
        });
        
        
        const updatedData = {
            Name:req.body.name,
            price:req.body.Price,
            discription:req.body.discription,
            Category:category._id,
            brand:req.body.brand,
            quantity:req.body.quantity,
            rating:req.body.rating,
            Image:imageToKeep,
        }

        if(req.files && req.files.length > 0){
            const newImages = req.files.map((file) => file.filename )
            // updatedData.Image = images;
            updatedData.Image.push(...newImages)
        }

        await productModel.findByIdAndUpdate(id,  updatedData )
        res.redirect("/admin/productView");
    } catch (error) {
        console.log(error.message)
    }
    
    
}

exports.productSearch_post = async(req,res)=>{
    try {
    const searchProduct = req.body.search;
    console.log(searchProduct)
    const searchdata = searchProduct.replace(/[^a-zA-Z0-9 ]/g, "")
        const allProduct = await productModel.find({
            $or: [
                { Name: { $regex: new RegExp( searchdata, "i") }},
              ]
        })
        res.render("admin/productSearchViews",{allProduct})
        
    } catch (error) {
        console.log(error.message)
    }
}

exports.productDelete = async(req,res)=>{
    try {
        const existingProduct = await productModel.findOne({_id:req.params.id})
        const existingImages = existingProduct.Image;
        // Delete previous images from fs
        existingImages.forEach((filename) => {
            fs.unlink(`productsImg/${filename}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
        await productModel.findByIdAndDelete({_id:req.params.id})
        res.redirect("/admin/productView")
    } catch (error) {
        console.log(error.message)
    }
}


// Category

exports.get_category = async(req,res)=>{
    const category = await CategoryModel.find()
    res.render("admin/categoryView",{category})
}

exports.get_addCategory  = async(req,res)=>{ 
    res.render("admin/addCategory")
}

exports.post_addCategory = async(req,res)=>{

    try {
        const category = req.body.name;
        const checking =  category.replace(/[^a-zA-Z0-9 ]/g, "")

        const exsist = await categoryModel.findOne({
            $or: [
                { name: { $regex: new RegExp( checking, "i") }},
              ]
        })

        // const exsist = await CategoryModel.findOne({name:req.body.name})
        
        if(exsist) {
            res.status(200).render("admin/addCategory",{message:"it is already exists"})
        }else{

            const newCategorey = new CategoryModel({
                name:req.body.name,
                discription:req.body.discription,
                discount:req.body.discount
            })
            console.log(req.body) 
    
            await newCategorey.save()
            res.render("admin/addCategory",{message:"Category add is sucessfully "})
        }
    } catch (error) {
        console.log(error);
        res.json(error)
    }
}

exports.get_editCategory = async(req,res)=>{
    const category = await categoryModel.findOne({_id:req.params.id})
    res.render("admin/editCategory",{category});
}

exports.post_editCategory = async(req,res)=>{
    try{
        const categoryId =req.params.id;
        const search = req.body.name;
        const categorydata = search.replace(/[^a-zA-Z0-9 ]/g, "")
        const sameCategory = await categoryModel.findOne({
            $or: [
                { name: { $regex: new RegExp( categorydata, "i") }},
              ]
        })

        if(sameCategory){
            const category = await categoryModel.find()

            res.render("admin/categoryView",{category,message:"it category already exists"});
            
        }else{

            const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, { 
                name:req.body.name,
                discription:req.body.discription,
                discount:req.body.discount
             }, { new: true });
            res.redirect("/admin/category");
        }
        
    } catch (error) {
        console.log(error.message)
    }
}
exports.post_searchCategory = async(req,res)=>{
    try {
        const search = req.body.searchCategory;

        const categorydata = search.replace(/[^a-zA-Z0-9 ]/g, "")
        const category = await categoryModel.find({
            $or: [
                { name: { $regex: new RegExp( categorydata, "i") }},
              ]
        })

        res.render("admin/searchCategory",{category})
    } catch (error) {
        console.log(error.massage)
    }
}







exports.userTableView = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;   // get the page number from the qurey paremeter
        const skip = (page-1) * productPerPage;
        const totalProduct = await UserModel.find().count()
        const totalPages = Math.ceil(totalProduct/productPerPage);

        const userdata = await UserModel.find().skip(skip).limit(productPerPage);
        
        res.render("admin/userViews" ,{userdata,currentPage:page,totalPages})
    }catch(error){
        console.log(error)
    }
}

exports.createUser_post = async(req,res)=>{
    try {
        console.log(req.body)
        const user = new UserModel({
            name:req.body.name,
            mobile:req.body.phone,
            email:req.body.email,
            password:req.body.password
        })
        await user.save();
        res.redirect("/admin/userView")
    } catch (error) {

        console.log(error.message)
        res.send(error)
    }
}
exports.createUser_get = async(req,res)=>{
    try {
        res.render("admin/createUser")
    } catch (error) {

        console.log(error)
    }
}

exports.userBlock = async (req,res)=>{
   
    try {
        const userId = req.params.id
        console.log(userId)
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
        res.redirect("/admin/userView")
    } catch (error) {
        console.log(error.message);
    }

    
}
exports.userUnblock = async (req,res)=>{
    try {
        const userId = req.params.id
        console.log(userId)
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
        res.redirect("/admin/userView")
    } catch (error) {
        console.log(error.message);
    }
}
exports.editUser_get = async(req,res)=>{
    const id = req.params.id;
    const user = await UserModel.findOne({_id:id})
    res.render("admin/updateUser",{user})
}

exports.editUser_post = async(req,res)=>{
    try {

        const userId =req.params.id;
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { 
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile
         }, { new: true });
        res.redirect("/admin/userView");
    } catch (error) {
        console.log(error.message)
    }
}

exports.userSearch = async(req,res)=>{
    const locals = {

    }
    try {
        let searchUser = req.body.seachUser;
        const searchdata = searchUser.replace(/[^a-zA-Z0-9 ]/g, "")
        const userdata = await UserModel.find({
            $or: [
                { name: { $regex: new RegExp( searchdata, "i") }},
              ]
        })
        res.render("admin/searchUser",{userdata})
    } catch (error) {
        console.log(error.message);
    }
}

// order details

exports.orderList = async (req,res)=>{
    try {
        const orderList = await orderModel.find();
        const user = orderList.map(item => item.userId )
        const userData = await userModel.find({_id:{ $in: user }});
        const orderWithData = orderList.map( order =>{
            const user = userData.find(user => user._id.toString() === order.userId.toString());
            return {
                ...order.toObject(),
                user:user
            }
        } )
        console.log(orderWithData);
        const ordersWithDataSorted = orderWithData.sort((a, b) => b.createdAt - a.createdAt);

        res.render('admin/orderdetails', { orderList: ordersWithDataSorted })
    } catch (error) {
        console.log(error.message)
    }
}


exports.orderDetails = async (req, res) => {
    try {
        const userId = req.body.userId;
        const orderId = req.body.orderId;
        const userDetails = await userModel.findOne({ _id: userId });
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
        console.log(cartProducts);
        const [orderCanceld] = order.map(item => item.orderCancleRequest);
        const orderStatus = order.map(item => item.status);
        res.render("admin/orderInformation", {  order, orderProducts, subTotal, address, orderCanceld, orderStatus, userDetails });
    } catch (error) {
        console.log(error + "orderdetailing error")
    }
}

exports.updateOrder = async (req,res)=>{
    try {
        await orderModel.findByIdAndUpdate({_id:req.params.id},
            {$set:{status:req.body.status}}
            );
            res.json("ok fine");
    } catch (error) {
        
    }
}

// coupon

exports.couponGet = async (req,res)=>{
    try {
        const couponData = await couponModel.find();
        res.render("admin/coupon",{couponData})
    } catch (error) {
       console.log(error.message)
    }
}
exports.addCouponGet = async (req,res)=>{
    try {
        res.render("admin/addCoupon")
    } catch (error) {
        console.log(error.message);
    }
}
exports.deleteCoupon = async (req,res)=>{
    try{
         await couponModel.findByIdAndDelete(req.params.id);
        res.json("deleted the coupon")
        
    }catch(error){
        console.log(error.message)
    }
}
exports.addCoupon = async (req,res) =>{
    const name = req.body.name;
    const exsisting = name.replace(/[^a-zA-Z0-9]/g, "") 
    const present = await couponModel.findOne({
        $or:[{couponName:{ $regex : new RegExp( exsisting, "i") }},]
    })
    console.log(req.body);
    if(present){

        res.status(300).json("it is already existed");

    }else{
        const coupon = new couponModel({
            couponName:req.body.name,
            couponValue:req.body.couponValue,
            expiryDate:req.body.expiryData,
            maxValue:req.body.maxValue,
            minValue:req.body.miniValue,
        })
        await coupon.save()
        res.status(200).json("coupon added");
    }
    

}

exports.removeCoupon = async (req,res)=>{
    try {
        const id = req.params.id;
        await couponModel.findByIdAndDelete(id)
        res.status(200).json("remove successfully")
    } catch (error) {
        console.log(error.message)
    }
}



