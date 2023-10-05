exports.errorHandling =  (error,req,res,next) =>{
    console.log(error);
    res.status(400).send({isSuccess: false, errorMessage: error.message})
}