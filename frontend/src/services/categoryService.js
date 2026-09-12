import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// Fetch all categories from the Django API.
function getCategories() {
  return axios.get(`${API_URL}/products/category/`);
}

export default getCategories;
