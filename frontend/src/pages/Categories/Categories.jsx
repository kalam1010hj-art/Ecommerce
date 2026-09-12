import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import getCategories from "../../services/categoryService";
import styles from "./Categories.module.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => {
        setError("Unable to load categories. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>SHOP BY</p>
          <h1>Categories</h1>
          <p>Find products quickly by choosing a category.</p>
        </div>

        {isLoading && <p className={styles.message}>Loading categories...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!isLoading && !error && categories.length === 0 && (
          <p className={styles.message}>No categories available yet.</p>
        )}

        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className={styles.card}
            >
              <span className={styles.icon}>🛍️</span>
              <span className={styles.name}>{category.name}</span>
              <span className={styles.view}>View products →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Categories;
