import axios from "axios";
function getCart(){
    
    let  token = localStorage.getItem("accessToken")
    console.log("token",token)
    return (axios.get("http://127.0.0.1:8000/cart/",
 
 {       headers: {
    Authorization: `Token ${token}`,
  }}))



}
export default getCart

export function addToCart(productId){
  let  token = localStorage.getItem("accessToken")
  return axios.post("http://127.0.0.1:8000/cart/",
    {
    product: productId,
    quantity: 1
}
    ,{
    headers:{
     Authorization: `Token ${token}`,
    }
  })
} 
export function updateCartItem(cartItemId, quantity) {
  let  token = localStorage.getItem("accessToken")
  return axios.put(
    `http://127.0.0.1:8000/cart/info/${cartItemId}`,
    {
      quantity: quantity
    },{
      headers:{
        Authorization:`Token ${token}`,
      }
    }
  );
}
export function deleteCartItem(cartItemId){
  let  token = localStorage.getItem("accessToken")
  return axios.delete(
    `http://127.0.0.1:8000/cart/info/${cartItemId}`,
    {
      headers:{
        Authorization:`Token ${token}`,
      }
    }
  )

}