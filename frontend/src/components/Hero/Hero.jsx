import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>

        {/* Hero Content */}
        <div className={styles.content}>
          <p className={styles.tagline}>
            Welcome to ShopCart
          </p>

          <h1 className={styles.title}>
            Everything you need,
            <span> in one place.</span>
          </h1>

          <p className={styles.description}>
            Discover quality products at great prices.
            Shop your favorites and get them delivered to your door.
          </p>

          <div className={styles.buttons}>
            <a href="/products" className={styles.primaryButton}>
              Shop Now
            </a>

            <a href="/categories" className={styles.secondaryButton}>
              Explore Categories
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className={styles.imageContainer}>
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80"
            alt="Shopping"
            className={styles.image}
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;