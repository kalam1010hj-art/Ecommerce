import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import getCart from "../services/cartService";
import { addToCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

function CartProvider({ children }) {
  let navigate = useNavigate();
  const { token } = useContext(AuthContext);
  console.log("CartProvider rendered!");

  const [cart, setCart] = useState(null);
  const [isLoading,setLoading] = useState(true)



 
  async function AddToCart(productID) {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(productID);
      const response = await getCart();
      setCart(response.data);
      navigate("/cart");
    } catch (error) {
      console.log("got an error", error);
    }
  }

  useEffect(() => {
    if (token) {
      setLoading(true)
      console.log("useEffecet rendered! and excecuted get cart");
      getCart()
        .then((response) => {
          console.log(response.data);
          setCart(response.data);
          
        })
        .catch((error) => {
          console.log("got an error", error);
        })
        .finally(() => {
        setLoading(false);
      });
    } else {
      setCart(null);
    }
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, AddToCart,setCart,isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
export { CartContext };
