import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth-store";

const PRIMARY_URL =
  (import.meta as any).env.VITE_API_URL || "https://sales-app-backend-jhxe.onrender.com";

let isRefreshing = false;

export const apiClient = axios.create({
  baseURL: `${PRIMARY_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "x-csrf-protection": "1",
  },
  timeout: 30000, // 30s allows cloud servers (e.g. Render spin-up) to wake up cleanly without timing out
  withCredentials: true,
});

function unwrapResponse(response: any) {
  if (
    response.data &&
    response.data.success === true &&
    Object.prototype.hasOwnProperty.call(response.data, "data")
  ) {
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

    // Retry once for network hiccups or cold-start timeouts
    if ((!error.response || error.code === "ECONNABORTED") && config && !config._isRetry) {
      config._isRetry = true;
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

