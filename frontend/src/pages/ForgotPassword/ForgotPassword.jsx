import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./ForgotPassword.module.css";

const API_URL = "https://ecommerce-0lq7.onrender.com/account";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage(response.data.detail);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.icon}>✉</div>
        <h1>Forgot your password?</h1>
        <p className={styles.subtitle}>
          Enter the email address linked to your ShopCart account and we'll send you a secure reset link.
        </p>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button disabled={loading} type="submit">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link className={styles.backLink} to="/login">← Back to login</Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
