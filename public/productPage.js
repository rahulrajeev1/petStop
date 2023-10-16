// const productModel = require("../model/productModel");



const btns = [
    {
        id:"cat",
        name:"Cats"
    },
    {
        id:"Dog",
        name:"Dog"
    },
    {
        id:"bird",
        name:"bird"
    },
]

const filters = [...new Set(btns.map((btn) => btn))]


document.getElementById("btns").innerHTML = filters.map((btn)=>{
    let {name,id} = btn;
    return(
        `<hr class="sidebar-divider">
            <li class="nav-item  active">
             <a class="nav-link" onclick ='filterItems("${id}")'>
            <span>${name}</span></a>
    </li>`
    )
})

const parentId = document.getElementById("parent");
function card(data){
    
    // Create a new card element
    
    const cardDiv = document.createElement("div")
    cardDiv.className = "col-md-4" ;
    
    
    // Card content
    cardDiv.innerHTML = `
    <div class= "card my-2 mt-2" style = "width: 12rem; ">
         <a href="/singleViewProduct/${data._id}">
        <img src="/productsImg/${data.Image[0]}" class="card-img-top"  " alt="${data.title}">
        </a>
        <div class="card-body">
            <p class="card-title text-truncate"><small>${data.Name}</small></p>
            <p><sup><strong>₹</strong></sup>${data.Price}</p>
            <a href="/singleViewProduct/${data._id}" class="btn btn-primary">show</a>
        </div>
        </div>
    `;
    parentId.append(cardDiv);

}
async function filterItems(id){
   
    parentId.innerHTML = " ";
    setFilters(id);
    radioBtnValue();
    console.log(id)
    const response = await fetch(`/productFilter/${id}`);
    const data = await response.json();
    console.log(data)
    data.forEach((data)=>{
          card(data)
          
    })
}
filterItems("all");

function radioBtnValue(){

    const filterRadios = document.querySelectorAll("#filterId [name='filter']");
    
    filterRadios.forEach((radio) => {
        console.log(radio)
        radio.addEventListener("click", async () => {
            console.log(radio.getAttribute("identify"))
            console.log(radio.value);
            const value = radio.value;
            const category = radio.getAttribute("identify");
            
                const response = await fetch(`/productGetFiltering/${category}/${value}`)
                const data = await response.json();
                parentId.innerHTML = " ";
                console.log(data)
                data.forEach((data)=>{
                     card(data)
          
                 })
        });
    });
};
function setFilters (name){
    
    const setFilter = document.getElementById("setFilter");
    setFilter.innerHTML= ' ';
  
    setFilter.innerHTML =` 
    <div class="form-check">
    <input class="form-check-input" type="radio" identify="${name}" name="filter" value="first">                      
        <span> 100-1000</span>
    </div>
    <div class="form-check">
    <input class="form-check-input" type="radio" identify="${name}" name="filter" value="second" >
        <span>1000-2000</span>
    </div>
    <div class="form-check">
    <input class="form-check-input" type="radio" identify="${name}" name="filter" value="third" checked>
        <span>above</span>
    </div>
    `
}




document.getElementById("c").innerHTML="hallo"
console.log("it working")
