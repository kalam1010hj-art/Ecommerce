import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Category/Category";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
function Home() {
  console.log("Home  rendered!")
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts/>
    </>
  );
}
export default Home;
