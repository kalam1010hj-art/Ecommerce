import axios from "axios";
function getCart(){
    
    let  token = localStorage.getItem("accessToken")
    console.log("token",token)
    return (axios.get("https://ecommerce-0lq7.onrender.com/cart/",
 
 {       headers: {
    Authorization: `Token ${token}`,
  }}))



}
export default getCart

export function addToCart(productId){
  let  token = localStorage.getItem("accessToken")
  return axios.post("https://ecommerce-0lq7.onrender.com/cart/",
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
    `https://ecommerce-0lq7.onrender.com/cart/info/${cartItemId}`,
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
    `https://ecommerce-0lq7.onrender.com/cart/info/${cartItemId}`,
    {
      headers:{
        Authorization:`Token ${token}`,
      }
    }
  )

}