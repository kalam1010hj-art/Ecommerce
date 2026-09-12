import axios from "axios";

const API_BASE_URL = "https://ecommerce-0lq7.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    Authorization: `Token ${token}`,
  };
}

// Ask Django to calculate the cart total and create the Razorpay order.
export function createPaymentOrder() {
  return axios.post(
    `${API_BASE_URL}/cart/payment/create/`,
    {},
    { headers: authHeaders() },
  );
}

// Send Razorpay's response to Django. Django verifies the signature and
// finalizes the order before the cart is cleared.
export function verifyPayment(paymentData) {
  return axios.post(
    `${API_BASE_URL}/cart/payment/verify/`,
    paymentData,
    { headers: authHeaders() },
  );
}
