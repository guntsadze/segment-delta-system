import axios from "axios";

const API_URL = "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor: ერორების უკეთესი მართვისთვის
api.interceptors.response.use(
  (response) => response.data, // პირდაპირ მონაცემებს დააბრუნებს (res.data-ს გარეშე)
  (error) => {
    const errorData = error.response?.data || {};
    console.error("API Error Details:", errorData);

    // შეგვიძლია მოვაწყოთ გლობალური ერორ ნოტიფიკაცია აქ
    return Promise.reject(error.response?.statusText || "Network Error");
  },
);
