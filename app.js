const express = require("express");

const path = require("path");
const adminRouter = require("./router/adminRouter")
const userRouter = require("./router/userRouter")
const app = express();
const cookieParser = require("cookie-parser");

app.use('/productsImg', express.static(path.resolve(__dirname, 'productsImg')));
app.use(cookieParser())
app.use(express.json());  
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs")
app.use(express.static("public"))


//connect database 
const db = require("./model/db"); 
db()

app.use( (req, res, next)=>{
    if (!req.userDetails)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  });
  

app.use("/",userRouter);
app.use("/admin",adminRouter);
app.get("*",(req,res)=>{
  res.render("error")
})

app.listen(3001,()=>{
    console.log("it working on 3001");
})