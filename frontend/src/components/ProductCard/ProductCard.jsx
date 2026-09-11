import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
function ProductCard({ product }) {
  let { AddToCart } = useContext(CartContext);
  const imageUrl = product.images?.[0]?.image
    ? `http://127.0.0.1:8000${product.images[0].image}`
    : "/placeholder.jpg";
  
  return (
    <article className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.productLink}>
        <div className={styles.imageContainer}>
          {product.images?.length > 0 ? (
            <img src={imageUrl} alt={product.name} className={styles.image} />
          ) : (
            <p>No image</p>
          )}
        </div>
      </Link>

      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>

        <p className={styles.price}>₹{product.price}</p>

        <p className={styles.stock}>
          {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
        </p>

        <button
          className={styles.cartButton}
          disabled={product.stock === 0}
          onClick={() => {
            console.log("add to cart button clicked")
            AddToCart(product.id);
          }}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
