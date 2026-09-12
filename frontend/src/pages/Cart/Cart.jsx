import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import styles from "./Cart.module.css";
import { updateCartItem, deleteCartItem } from "../../services/cartService";

function Cart() {
  const navigate = useNavigate();
  const { cart, setCart, isLoading } = useContext(CartContext);

  const [updatingItems, setUpdatingItems] = useState({});
  const [error, setError] = useState("");

  const imageUrl = (path) => {
    return `http://127.0.0.1:8000/${path}`;
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading cart...</h2>
        <p>Please wait...</p>
      </div>
    );
  }

  if (!cart) {
    return <p>Unable to load cart.</p>;
  }

  if (cart.items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart.</p>
      </div>
    );
  }

  function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) return;

    setError("");
    setUpdatingItems((previous) => ({ ...previous, [cartItemId]: true }));

    updateCartItem(cartItemId, newQuantity)
      .then((response) => {
        const updatedItem = response.data;
        setCart((previousCart) => ({
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        }));
      })
      .catch((error) => {
        console.log(error);
        setError("Unable to update quantity. Please try again.");
      })
      .finally(() => {
        setUpdatingItems((previous) => ({ ...previous, [cartItemId]: false }));
      });
  }

  function DeleteCartItem(id) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this item from your cart?",
    );
    if (!confirmed) return;

    setError("");
    setUpdatingItems((previous) => ({ ...previous, [id]: true }));

    deleteCartItem(id)
      .then(() => {
        setCart((previousCart) => ({
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== id),
        }));
      })
      .catch((error) => {
        console.log(error);
        setError("Unable to remove item. Please try again.");
      })
      .finally(() => {
        setUpdatingItems((previous) => ({ ...previous, [id]: false }));
      });
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Shopping Cart</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.cartContent}>
        <div className={styles.items}>
          {cart.items.map((item) => (
            <div className={styles.cartItem} key={item.id}>
              <img
                src={imageUrl(item.product.images[0].image)}
                alt={item.product.name}
                className={styles.productImage}
              />

              <div className={styles.productInfo}>
                <h2>{item.product.name}</h2>
                <p className={styles.price}>
                  ₹{Number(item.product.price).toFixed(2)}
                </p>

                <div className={styles.quantity}>
                  <button
                    disabled={
                      updatingItems[item.id] ||
                      item.quantity >= item.product.stock
                    }
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={
                      updatingItems[item.id] ||
                      item.quantity >= item.product.stock
                    }
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.itemTotal}>
                ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
              </div>

              <button
                className={styles.removeButton}
                disabled={updatingItems[item.id]}
                onClick={() => DeleteCartItem(item.id)}
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Items</span>
            <span>{cart.items.length}</span>
          </div>
          <hr />
          <div className={styles.total}>
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <button
            className={styles.checkoutButton}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
