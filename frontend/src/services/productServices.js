import axios from "axios";

const API_URL = "https://ecommerce-0lq7.onrender.com";

// Fetch products with optional search, category and sorting filters.
function HandleProduct(params = {}) {
  return axios.get(`${API_URL}/products`, { params });
}

function getProduct(id) {
  return axios.get(`${API_URL}/products/info/${id}`);
}

export { getProduct };
export default HandleProduct;
