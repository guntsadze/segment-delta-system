import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * ✅ 1. INTERFACE განსაზღვრა
 * - Generic ტიპი `R` განსაზღვრავს, რა დაბრუნდება პირდაპირ
 * - დეფოლტი `T` არის response-ის სტრუქტურა
 */
interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R>;
  put<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R>;
  patch<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R>;
  delete<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
}

/**
 * ✅ 2. ENVIRONMENT VALIDATION
 * - სენიორები პირველი რაც აკეთებენ - validate env variables
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "⚠️ NEXT_PUBLIC_API_URL is not defined in environment variables",
  );
}

/**
 * ✅ 3. API INSTANCE შექმნა
 * - timeout: 10s (რეალურ ცხოვრებაში შეიძლება ატვილდეს endpointის მიხედვით)
 * - retry logic: ხშირად არის დაამატებული
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
}) as CustomAxiosInstance;

/**
 * ✅ 4. REQUEST INTERCEPTOR
 * - ტოკენის დამატება Authorization header-ში
 * - request-თან დაკავშირებული მეტადატা
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ვარიანტი A: localStorage (client-side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // ვარიანტი B: cookies (უფრო უსაფრთხო ფორ production)
    // - axios auto-ამატებს cookies თუ withCredentials: true
    // config.withCredentials = true;

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

/**
 * ✅ 5. RESPONSE INTERCEPTOR
 * - .data დაბრუნება (response wrapper არ სჭირდება)
 * - ცენტრალური error handling
 * - 401 → auto logout
 * - 4xx/5xx → user-friendly messages
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ SUCCESS CASE
    // დაბრუნებს მხოლოდ response body-ს
    return response.data;
  },
  (error) => {
    // ❌ ERROR CASE

    // Extract error details
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unknown error occurred";

    const status = error.response?.status || 0;

    const errorResponse = {
      message,
      status,
      data: error.response?.data,
    };

    // Console logging (უსაფრთხო უნდა იყოს production-ში)
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${status}: ${message}`, error.response?.data);
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        // Bad Request - validation errors
        console.warn("🚫 Validation Error:", error.response?.data);
        break;

      case 401:
        // Unauthorized - token expired/invalid
        console.warn("🔐 Unauthorized - logging out");
        // logoutUser();
        // window.location.href = "/login";
        break;

      case 403:
        // Forbidden - insufficient permissions
        console.warn("🚫 Access Forbidden");
        break;

      case 404:
        // Not Found
        console.warn("🔍 Resource not found");
        break;

      case 429:
        // Too Many Requests - rate limiting
        console.warn("⏰ Rate limit exceeded");
        break;

      case 500:
      case 502:
      case 503:
        // Server errors
        console.error("🔴 Server Error");
        break;

      default:
        break;
    }

    // აბრუნებს რეჯექტს თუ component-მა შეძლოს error handling
    return Promise.reject(errorResponse);
  },
);

/**
 * ✅ 6. EXPORT ADDITIONAL UTILITIES
 * - helper functions რომელიც სხვა სენიორებმა შეიძლება გამოიყენონ
 */

/**
 * აკადემიური ფუნქცია - API call wrapper
 * @example
 * const data = await apiCall<UserType>("/users/1")
 */
export async function apiCall<T = any>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await api.get<T>(url, options);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Retry logic (ოპციონალურ - სენიორული ვარიანტი)
 * @example
 * await apiCallWithRetry<UserType>("/users/1", 3)
 */
export async function apiCallWithRetry<T = any>(
  url: string,
  retries = 3,
  delay = 1000,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await api.get<T>(url);
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
      // თუ შეცდომა წარმოიქმნა, დაელოდოს და ხელახლა სცადოს
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
  throw new Error("Failed after all retries");
}

export default api;
