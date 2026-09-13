import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import styles from "./Profile.module.css";

const API_URL = "https://ecommerce-0lq7.onrender.com/account";

function getInitials(user) {
  const first = user?.first_name?.trim()?.[0] || "";
  const last = user?.last_name?.trim()?.[0] || "";
  return (first + last || user?.username?.slice(0, 2) || "U").toUpperCase();
}

function Profile() {
  const { token, user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || {});
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = response.data;
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
        });
        login(token, { ...user, ...data });
      } catch (err) {
        setError(err.response?.data?.detail || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const completion = useMemo(() => {
    const fields = [form.first_name, form.last_name, form.email, form.phone_number];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);

  const memberSince = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Recently joined";

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage("");
    setError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.patch(`${API_URL}/profile`, form, {
        headers: { Authorization: `Token ${token}` },
      });
      const updated = response.data;
      setProfile(updated);
      setForm({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        email: updated.email || "",
        phone_number: updated.phone_number || "",
      });
      login(token, { ...user, ...updated });
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      const detail = err.response?.data;
      setError(typeof detail === "string" ? detail : detail?.detail || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <main className={styles.page}><div className={styles.loading}>Loading your profile<span>...</span></div></main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow}></div>
      <section className={styles.wrapper}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>MY ACCOUNT</p>
            <h1>Your Profile</h1>
            <p className={styles.headingText}>Manage your ShopCart identity and account details.</p>
          </div>
          <Link to="/products" className={styles.shopButton}>Continue shopping <span>→</span></Link>
        </div>

        {(message || error) && <div className={message ? styles.success : styles.error}>{message || error}</div>}

        <div className={styles.grid}>
          <aside className={styles.sidebar}>
            <div className={styles.profileHero}>
              <div className={styles.avatar}>{getInitials(profile)}</div>
              <div className={styles.onlineDot}></div>
              <h2>{profile.first_name || profile.last_name ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : profile.username}</h2>
              <p>@{profile.username}</p>
              <span className={styles.memberBadge}>● Member since {memberSince}</span>
            </div>

            <div className={styles.completionCard}>
              <div className={styles.completionTop}><span>Profile strength</span><strong>{completion}%</strong></div>
              <div className={styles.progress}><span style={{ width: `${completion}%` }}></span></div>
              <p>{completion === 100 ? "Your profile is complete ✨" : "Add your missing details to complete your profile."}</p>
            </div>

            <div className={styles.quickLinks}>
              <Link to="/cart"><span>🛒</span> My cart <b>→</b></Link>
              <Link to="/products"><span>✨</span> Discover products <b>→</b></Link>
              <button onClick={handleLogout}><span>↪</span> Sign out <b>→</b></button>
            </div>
          </aside>

          <div className={styles.content}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div><p className={styles.cardKicker}>PERSONAL DETAILS</p><h3>Account information</h3></div>
                {!editing && <button className={styles.editButton} onClick={() => { setEditing(true); setMessage(""); }}>Edit profile</button>}
              </div>

              {editing ? (
                <form className={styles.form} onSubmit={saveProfile}>
                  <div className={styles.formGrid}>
                    <label>First name<input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" /></label>
                    <label>Last name<input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" /></label>
                    <label>Email address<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" /></label>
                    <label>Mobile number<input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+91 9876543210" /></label>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelButton} onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" className={styles.saveButton} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                  </div>
                </form>
              ) : (
                <div className={styles.detailsGrid}>
                  <div className={styles.detail}><span>FULL NAME</span><strong>{profile.first_name || profile.last_name ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Not added yet"}</strong></div>
                  <div className={styles.detail}><span>USERNAME</span><strong>@{profile.username}</strong></div>
                  <div className={styles.detail}><span>EMAIL</span><strong>{profile.email || "Not added yet"}</strong></div>
                  <div className={styles.detail}><span>MOBILE</span><strong>{profile.phone_number || "Not added yet"}</strong></div>
                </div>
              )}
            </div>

            <div className={styles.featureGrid}>
              <div className={styles.featureCard}><div className={styles.featureIcon}>🔐</div><div><h4>Secure account</h4><p>Your account is protected by token authentication.</p></div><span className={styles.secure}>Protected</span></div>
              <div className={styles.featureCard}><div className={styles.featureIcon}>⚡</div><div><h4>Quick checkout</h4><p>Keep your contact details ready for a smoother purchase.</p></div><Link to="/cart">Open cart →</Link></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;
