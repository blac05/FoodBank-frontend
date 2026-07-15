import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://foodbank-backend-lz1k.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodbank_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If several requests 401 at once (e.g. a page load fires 3 calls with an
// expired token), only refresh once and let the rest wait on the same promise.
let refreshPromise = null;

function clearSession() {
  localStorage.removeItem("foodbank_token");
  localStorage.removeItem("foodbank_refresh_token");
  localStorage.removeItem("foodbank_user");
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("foodbank_refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  // Plain axios call (not the `api` instance) so this request never
  // recurses back into this same interceptor.
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  localStorage.setItem("foodbank_token", data.accessToken);
  localStorage.setItem("foodbank_refresh_token", data.refreshToken);
  localStorage.setItem("foodbank_user", JSON.stringify(data.user));
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/signup");
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        refreshPromise = null;
        clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);