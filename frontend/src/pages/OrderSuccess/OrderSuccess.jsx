import { useNavigate, useParams } from "react-router-dom";
import styles from "./OrderSuccess.module.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1>Payment successful!</h1>
        <p>
          Your order <strong>#{id}</strong> has been confirmed.
        </p>
        <p className={styles.note}>
          Your payment was verified by the server and your cart has been cleared.
        </p>
        <button onClick={() => navigate("/products")}>Continue shopping</button>
      </div>
    </main>
  );
}

export default OrderSuccess;
