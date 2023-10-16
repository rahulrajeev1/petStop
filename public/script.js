const { json, response } = require("express")

document.getElementById("form").addEventListener('submit',(e)=>{
    console.log("trdt")
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch("http://16.171.193.157:3001/admin/addProduct",{
        method:"post",
        body:formData,
    }).then((response)=>{
        if(response.ok)   response.json()
        else throw new Error("Faild to subit")
      
    }).then((html)=> document.documentElement.innerHTML = html)
}).catch(error =>{
    console.log(error)
})