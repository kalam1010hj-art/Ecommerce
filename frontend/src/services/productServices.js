import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// Fetch products with optional search, category and sorting filters.
function HandleProduct(params = {}) {
  return axios.get(`${API_URL}/products`, { params });
}

function getProduct(id) {
  return axios.get(`${API_URL}/products/info/${id}`);
}

export { getProduct };
export default HandleProduct;
