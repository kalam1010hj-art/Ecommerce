import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "https://ecommerce-0lq7.onrender.com/account";

function Login() {
  const [mode, setMode] = useState("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/mobile/send-otp`, { phone });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/mobile/verify-otp`, { phone, otp });
      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Welcome Back</h1>
        <p className={styles.subtitle}>Login to your ShopCart account</p>

        <div className={styles.tabs}>
          <button type="button" className={mode === "password" ? styles.activeTab : ""} onClick={() => switchMode("password")}>
            Password
          </button>
          <button type="button" className={mode === "mobile" ? styles.activeTab : ""} onClick={() => switchMode("mobile")}>
            Mobile OTP
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button disabled={loading} type="submit" className={styles.button}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? verifyOtp : sendOtp}>
            <div className={styles.formGroup}>
              <label>Mobile Number</label>
              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={otpSent} required />
              <small>We'll send a one-time password by SMS.</small>
            </div>

            {otpSent && (
              <div className={styles.formGroup}>
                <label>OTP</label>
                <input type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
              </div>
            )}

            <button disabled={loading} type="submit" className={styles.button}>
              {loading ? "Please wait..." : otpSent ? "Verify & Login" : "Send OTP"}
            </button>

            {otpSent && (
              <button type="button" className={styles.resendButton} disabled={loading} onClick={() => { setOtpSent(false); setOtp(""); }}>
                Change number
              </button>
            )}
          </form>
        )}

        <p className={styles.registerText}>
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
