exports.errorHandling =  (error,req,res,next) =>{
    console.log(error.message);
    res.status(400).send({isSuccess: false, errorMessage: error.message})
}