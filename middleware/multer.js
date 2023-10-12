 const multer = require("multer");

//  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './productsImg'); // Destination folder for uploaded images
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
//   }
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './productsImg'); // Destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
  }
});



 const store = multer({storage:storage})

 

 const banner = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './banner'); // Destination folder for uploaded images
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
    }
  }); 
const banners = multer({storage: banner});

 module.exports = {store,banners};