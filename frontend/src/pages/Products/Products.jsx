import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./Products.module.css";
import HandleProduct from "../../services/productServices";
import getCategories from "../../services/categoryService";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const ordering = searchParams.get("ordering") || "";

  // Load categories once so the product page can filter without hard-coding names.
  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
  }, []);

  // Ask Django for the filtered product list whenever the URL filters change.
  useEffect(() => {
    setIsLoading(true);
    setError("");

    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (ordering) params.ordering = ordering;

    HandleProduct(params)
      .then((response) => setProducts(response.data))
      .catch(() => setError("Unable to load products. Please try again."))
      .finally(() => setIsLoading(false));
  }, [search, category, ordering]);

  function submitSearch(event) {
    event.preventDefault();
    const value = searchInput.trim();
    const next = {};

    if (value) next.search = value;
    if (category) next.category = category;
    if (ordering) next.ordering = ordering;

    setSearchParams(next);
  }

  function changeCategory(value) {
    const next = {};
    if (search) next.search = search;
    if (value) next.category = value;
    if (ordering) next.ordering = ordering;
    setSearchParams(next);
  }

  function changeOrdering(value) {
    const next = {};
    if (search) next.search = search;
    if (category) next.category = category;
    if (value) next.ordering = value;
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  const selectedCategory = categories.find(
    (item) => String(item.id) === String(category)
  );

  return (
    <main className={styles.products}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h1>{selectedCategory ? selectedCategory.name : "All Products"}</h1>
          <p>
            {search
              ? `Search results for “${search}”`
              : "Explore our collection of products."}
          </p>
        </div>

        <form className={styles.filters} onSubmit={submitSearch}>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </div>

          <div className={styles.filterRow}>
            <select
              value={category}
              onChange={(event) => changeCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={ordering}
              onChange={(event) => changeOrdering(event.target.value)}
              aria-label="Sort products"
            >
              <option value="">Sort by</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
              <option value="-created_at">Newest</option>
              <option value="created_at">Oldest</option>
            </select>

            {(search || category || ordering) && (
              <button type="button" className={styles.clearButton} onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </form>

        {isLoading && <p className={styles.message}>Loading products...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!isLoading && !error && products.length === 0 && (
          <div className={styles.empty}>
            <h2>No products found</h2>
            <p>Try a different search or category.</p>
            <button onClick={clearFilters}>View all products</button>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Products;
