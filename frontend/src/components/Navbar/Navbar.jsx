import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const { cart } = useContext(CartContext);
  const { token, logout } = useContext(AuthContext);

  const cartLength = cart ? cart.items.length : 0;

  function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (confirmLogout) {
      logout();
      setMenuOpen(false);
    }
  }

  // Send the search term to the Products page as a URL query parameter.
  function handleSearch(event) {
    event.preventDefault();
    const value = searchInput.trim();

    navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
    setSearchInput("");
    setMenuOpen(false);
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Shop<span>Cart</span>
        </Link>

        <nav className={styles.desktopNav}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>Products</Link>
          <Link to="/categories" className={styles.navLink}>Categories</Link>
        </nav>

        <div className={styles.actions}>
          {/* Search */}
          <form className={styles.navSearch} onSubmit={handleSearch}>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search..."
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search products">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </form>

          <Link to="/cart" className={styles.cartButton} aria-label="Cart">
            <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className={styles.cartCount}>{cartLength}</span>
          </Link>

          {!token ? (
            <Link to="/login" className={styles.loginButton}>Login</Link>
          ) : (
            <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
          )}

          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <nav className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}>
        <form className={styles.mobileSearch} onSubmit={handleSearch}>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
        <Link to="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>

        {!token ? (
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        ) : (
          <button className={styles.mobileLogout} onClick={handleLogout}>Logout</button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
