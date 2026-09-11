import axios from "axios"

function HandleProduct(){
    return(
        axios.get("http://127.0.0.1:8000/products")
    )
} export default HandleProduct;

function getProduct(id){
    return(
        axios.get(`http://127.0.0.1:8000/products/info/${id}`)
    )
}export {getProduct}