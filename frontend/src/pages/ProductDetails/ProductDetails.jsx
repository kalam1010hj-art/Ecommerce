import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./ProductDetails.module.css";
import { getProduct } from "../../services/productServices";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   console.log("Product details rendered!")
  useEffect(() => {
    setLoading(true);
    getProduct(id)
    .then((response)=>{
        console.log("product details",response.data)
        setProduct(response.data)
        setLoading(false)
        
    })
    .catch((response)=>{
        console.log("got an error")
    })
  
  }, [id]);

  // Loading
  if (loading) {
    return (
      <main className={styles.message}>
        <p>Loading product...</p>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className={styles.message}>
        <p>{error}</p>
      </main>
    );
  }

  // Product not found
  if (!product) {
    return (
      <main className={styles.message}>
        <p>Product not found.</p>
      </main>
    );
  }

  const imageUrl = (imagePath) => {
    return `http://127.0.0.1:8000${imagePath}`;
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = () => {
    console.log("Product:", product.id);
    console.log("Quantity:", quantity);

    // Cart API will be connected here later.
  };

  return (
    <main className={styles.productDetails}>
      <div className={styles.container}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className={styles.product}>

          {/* =========================
              Image Gallery
          ========================= */}
          <div className={styles.gallery}>

            {/* Main Image */}
            <div className={styles.mainImageContainer}>
              {product.images?.length > 0 ? (
                <img
                  src={imageUrl(
                    product.images[selectedImage].image
                  )}
                  alt={product.name}
                  className={styles.mainImage}
                />
              ) : (
                <div className={styles.noImage}>
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`${styles.thumbnail} ${
                      selectedImage === index
                        ? styles.activeThumbnail
                        : ""
                    }`}
                  >
                    <img
                      src={imageUrl(image.image)}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* =========================
              Product Information
          ========================= */}
          <div className={styles.info}>

            <p className={styles.label}>
              Product
            </p>

            <h1 className={styles.name}>
              {product.name}
            </h1>

            <p className={styles.price}>
              ₹{product.price}
            </p>

            <div className={styles.divider}></div>

            {/* Description */}
            <div className={styles.section}>
              <h2>Description</h2>

              <p className={styles.description}>
                {product.description}
              </p>
            </div>

            {/* Stock */}
            <div className={styles.stock}>
              {product.stock > 0 ? (
                <>
                  <span className={styles.stockDot}></span>
                  {product.stock} available
                </>
              ) : (
                <span className={styles.outOfStock}>
                  Out of stock
                </span>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className={styles.quantitySection}>
                <h2>Quantity</h2>

                <div className={styles.quantityControl}>
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              className={styles.cartButton}
              onClick={addToCart}
              disabled={product.stock === 0}
            >
              {product.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;