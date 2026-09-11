import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./Products.module.css";
import HandleProduct from "../../services/productServices";
import { Link } from "react-router-dom";


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
];


function Products() {

  let [products,setProducts] = useState([])

  useEffect(()=>{
    HandleProduct()
    .then((response)=>{
      console.log("Products = ",response.data)
      setProducts(response.data)
    })
    .catch((response)=>{
        console.log("Got an error",response)
    })

},[])
console.log("Product page rendered")
  return (
    <main className={styles.products}>
      <div className={styles.container}>

        <div className={styles.heading}>
          <h1>All Products</h1>
          <p>Explore our collection of products.</p>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </main>
  );
}

export default Products;