import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import HandleProduct from "../../services/productServices";
import styles from "./FeaturedProducts.module.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFeaturedProducts() {
      try {
        setIsLoading(true);
        setError("");

        // Use the newest products as the featured products on the home page.
        const response = await HandleProduct({ ordering: "-created_at" });
        const data = Array.isArray(response.data) ? response.data : [];

        if (isMounted) {
          setProducts(data.slice(0, 4));
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load featured products right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.featured}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <p className={styles.subtitle}>Our Selection</p>
          <h2 className={styles.title}>Featured Products</h2>
          <p className={styles.description}>
            Discover some of the latest products in our store.
          </p>
        </div>

        {isLoading && (
          <div className={styles.status} role="status">
            Loading featured products...
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.status} role="alert">
            <p>{error}</p>
            <Link to="/products" className={styles.statusLink}>
              Browse all products →
            </Link>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className={styles.status}>
            <p>No products are available yet.</p>
            <Link to="/products" className={styles.statusLink}>
              Browse products →
            </Link>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className={styles.viewAll}>
          <Link to="/products" className={styles.viewButton}>
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
