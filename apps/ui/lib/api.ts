import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = T>(
    url: string,
    config?: AxiosRequestConfig & { skipErrorToast?: boolean },
  ): Promise<R>;
  post<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { skipErrorToast?: boolean },
  ): Promise<R>;
  put<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { skipErrorToast?: boolean },
  ): Promise<R>;
  patch<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { skipErrorToast?: boolean },
  ): Promise<R>;
  delete<T = any, R = T>(
    url: string,
    config?: AxiosRequestConfig & { skipErrorToast?: boolean },
  ): Promise<R>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "⚠️ NEXT_PUBLIC_API_URL is not defined in environment variables",
  );
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
}) as CustomAxiosInstance;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const config = error.config as AxiosRequestConfig & {
      skipErrorToast?: boolean;
    };
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

    // --- გლობალური ერორები ---
    if (!config?.skipErrorToast) {
      if (status === 401) {
        toast.error("სესია ამოიწურა, გთხოვთ გაიაროთ ავტორიზაცია");
      } else if (status === 403) {
        toast.error("თქვენ არ გაქვთ ამ მოქმედების უფლება");
      } else if (status >= 500) {
        toast.error("სერვერის შეცდომა, სცადეთ მოგვიანებით");
      } else {
        toast.error(message);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${status}: ${message}`, error.response?.data);
    }

    return Promise.reject(errorResponse);
  },
);

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
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Failed after all retries");
}

export default api;
