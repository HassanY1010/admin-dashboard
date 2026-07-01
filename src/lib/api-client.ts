import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth-store";

const BASE_URLS = [
  (import.meta as any).env.VITE_API_URL || "https://sales-app-backend-jhxe.onrender.com",
  "http://localhost:3000",
];

let currentUrlIndex = 0;
let isRefreshing = false;

export const apiClient = axios.create({
  baseURL: `${BASE_URLS[currentUrlIndex]}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "x-csrf-protection": "1",
  },
  timeout: 5000,
  withCredentials: true,
});

const rotateBaseUrl = () => {
  currentUrlIndex = (currentUrlIndex + 1) % BASE_URLS.length;
  apiClient.defaults.baseURL = `${BASE_URLS[currentUrlIndex]}/api/v1`;
  return BASE_URLS[currentUrlIndex];
};

function unwrapResponse(response: any) {
  if (response.data && response.data.success === true && Object.prototype.hasOwnProperty.call(response.data, "data")) {
    response.data = response.data.data;
  }
  return response;
}

function clearAdminSession() {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

apiClient.interceptors.response.use(
  unwrapResponse,
  async (error: AxiosError) => {
    const config = error.config as any;

    if ((!error.response || error.code === "ECONNABORTED") && config && !config._isRetry) {
      config._isRetry = true;
      rotateBaseUrl();
      return apiClient(config);
    }

    if (error.response?.status === 401 && config && !config._refreshRetry && !isRefreshing) {
      try {
        isRefreshing = true;
        config._refreshRetry = true;
        await apiClient.post("/auth/refresh", {});
        return apiClient(config);
      } catch {
        clearAdminSession();
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      clearAdminSession();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
