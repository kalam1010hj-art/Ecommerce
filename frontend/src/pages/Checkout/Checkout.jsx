import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../../services/paymentService";
import styles from "./Checkout.module.css";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://ecommerce-0lq7.onrender.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const navigate = useNavigate();
  const { cart, setCart } = useContext(CartContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    if (!cart?.items?.length || isProcessing) {
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const { data } = await createPaymentOrder();

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.order_id,
        theme: {
          color: "#111827",
        },

        handler: async (response) => {
          try {
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verification.data.success) {
              throw new Error("Payment could not be verified.");
            }

            // The backend clears the real cart only after verification.
            setCart((previousCart) =>
              previousCart ? { ...previousCart, items: [] } : previousCart,
            );

            navigate(`/orders/${verification.data.order_id}/success`, {
              replace: true,
            });
          } catch (verificationError) {
            console.error(verificationError);
            setError(
              verificationError.response?.data?.error ||
                "Payment was received, but verification failed. Please contact support before trying again.",
            );
          } finally {
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed", response.error);
        setError(
          response.error?.description ||
            "Payment failed. Your cart has not been cleared.",
        );
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (paymentError) {
      console.error(paymentError);
      setError(
        paymentError.response?.data?.error ||
          paymentError.message ||
          "Unable to start payment. Please try again.",
      );
      setIsProcessing(false);
    }
  }

  if (!cart?.items?.length) {
    return (
      <main className={styles.container}>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/products")}>Browse products</button>
      </main>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1>Secure Checkout</h1>
        <p className={styles.subtitle}>
          Review your order and pay securely with Razorpay.
        </p>

        <div className={styles.items}>
          {cart.items.map((item) => (
            <div className={styles.row} key={item.id}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <strong>
                ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div className={styles.total}>
          <span>Total</span>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.payButton}
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Opening secure payment..." : `Pay ₹${total.toFixed(2)}`}
        </button>

        <button
          className={styles.backButton}
          onClick={() => navigate("/cart")}
          disabled={isProcessing}
        >
          Back to cart
        </button>
      </div>
    </main>
  );
}

export default Checkout;
