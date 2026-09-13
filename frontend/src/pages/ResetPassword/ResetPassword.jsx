import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ResetPassword.module.css";

const API_URL = "https://ecommerce-0lq7.onrender.com/account";

function ResetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/reset-password/${uidb64}/${token}`, {
        password,
        confirm_password: confirmPassword,
      });
      navigate("/login", { state: { message: "Password reset successfully. You can now log in." } });
    } catch (err) {
      setError(err.response?.data?.detail || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.icon}>🔐</div>
        <h1>Create a new password</h1>
        <p className={styles.subtitle}>Choose a strong password for your ShopCart account.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />

          <p className={styles.hint}>Use at least 8 characters. Avoid common passwords.</p>

          <button disabled={loading} type="submit">
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>

        <Link className={styles.backLink} to="/login">← Back to login</Link>
      </section>
    </main>
  );
}

export default ResetPassword;
