import axios from "axios";

const API_URL = "https://ecommerce-0lq7.onrender.com";

// Fetch all categories from the Django API.
function getCategories() {
  return axios.get(`${API_URL}/products/category/`);
}

export default getCategories;
