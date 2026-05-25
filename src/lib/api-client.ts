import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getStoredRefreshToken, useAuthStore } from "./auth-store";

// @ts-ignore
// Configuration for failover IPs
const BASE_URLS = [
  (import.meta as any).env.VITE_API_URL || "https://sales-app-backend-6o15.onrender.com",
  "http://localhost:3000"
];

let currentUrlIndex = 0;

export const apiClient = axios.create({
  baseURL: `${BASE_URLS[currentUrlIndex]}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // Reduced timeout for faster failover
});

// Function to switch to the next available URL
const rotateBaseUrl = () => {
  currentUrlIndex = (currentUrlIndex + 1) % BASE_URLS.length;
  apiClient.defaults.baseURL = `${BASE_URLS[currentUrlIndex]}/api/v1`;
  console.log(`Switched API Base URL to: ${BASE_URLS[currentUrlIndex]}`);
  return BASE_URLS[currentUrlIndex];
};


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Automatically unwrap the standard backend response structure
    if (response.data && response.data.success === true && response.data.hasOwnProperty('data')) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;
    
    // If it's a network error or timeout, and we haven't retried this specific request yet
    if ((!error.response || error.code === 'ECONNABORTED') && config && !(config as any)._isRetry) {
      (config as any)._isRetry = true;
      
      // Switch IP
      rotateBaseUrl();
      
      // Update config baseURL and retry
      config.baseURL = apiClient.defaults.baseURL;
      return apiClient(config);
    }

    if (error.response?.status === 401 && config && !(config as any)._refreshRetry) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          (config as any)._refreshRetry = true;
          const { data } = await axios.post(`${BASE_URLS[currentUrlIndex]}/api/v1/auth/refresh`, { refreshToken });
          const payload = data?.success === true && data?.data ? data.data : data;
          localStorage.setItem("admin_token", payload.accessToken);
          localStorage.setItem("admin_refresh_token", payload.refreshToken);
          useAuthStore.getState().setAuth(payload.user, payload.accessToken, payload.refreshToken);
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${payload.accessToken}`;
          return apiClient(config);
        } catch {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          localStorage.removeItem("admin_user");
          window.location.href = "/login";
        }
      }
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }

);

export default apiClient;
