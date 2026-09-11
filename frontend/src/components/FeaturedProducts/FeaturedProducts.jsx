import ProductCard from "../ProductCard/ProductCard";
import styles from "./FeaturedProducts.module.css";

const products = [
  {
    id: 1,
    name: "Classic Sneakers",
    category: "Shoes",
    price: 1299,
    rating: 4.5,
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 1999,
    rating: 4.7,
    discount: 15,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Casual T-Shirt",
    category: "Fashion",
    price: 599,
    rating: 4.3,
    discount: 10,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Modern Wrist Watch",
    category: "Accessories",
    price: 899,
    rating: 4.6,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
  },
];

function FeaturedProducts() {
  return (
    <section className={styles.featured}>
      <div className={styles.container}>

        {/* Section Heading */}
        <div className={styles.heading}>
          <p className={styles.subtitle}>Our Selection</p>

          <h2 className={styles.title}>
            Featured Products
          </h2>

          <p className={styles.description}>
            Check out some of our popular products.
          </p>
        </div>

        {/* Product Grid */}
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* View All */}
        <div className={styles.viewAll}>
          <a href="/products" className={styles.viewButton}>
            View All Products →
          </a>
        </div>

      </div>
    </section>
  );
}

export default FeaturedProducts;