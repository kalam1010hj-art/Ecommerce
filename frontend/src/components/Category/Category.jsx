import styles from "./Category.module.css";

const categories = [
  {
    id: 1,
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Home",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
  },
];

function Categories() {
  return (
    <section className={styles.categories}>
      <div className={styles.container}>

        {/* Section Heading */}
        <div className={styles.heading}>
          <p className={styles.subtitle}>Explore</p>

          <h2 className={styles.title}>
            Shop by Category
          </h2>

          <p className={styles.description}>
            Find exactly what you're looking for.
          </p>
        </div>

        {/* Categories */}
        <div className={styles.grid}>
          {categories.map((category) => (
            <a
              href={`/products?category=${category.id}`}
              className={styles.card}
              key={category.id}
            >
              <img
                src={category.image}
                alt={category.name}
                className={styles.image}
              />

              <div className={styles.overlay}>
                <h3>{category.name}</h3>

                <span>Shop Now →</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Categories;