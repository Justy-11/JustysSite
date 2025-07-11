import axios from "axios";

const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";

console.log("API Base URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
  withCredentials: true,
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

// Function to clear cookies from frontend
const clearCookies = () => {
  // Clear cookies by setting them to expire in the past
  document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "messages=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

const processQueue = (error, response = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(response);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 and not already trying to refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        })
        .then(() => api(originalRequest))
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post("/api/token/refresh/");
        console.log("Refresh response:", refreshResponse);
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed:", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Only try to clear cookies if refresh cookie was present
        try {
          await api.post("/api/clear-cookies/");
          console.log("Cookies cleared successfully");
        } catch (clearError) {
          console.log("Failed to clear cookies via API, using frontend fallback:", clearError);
          // Fallback: clear cookies from frontend
          clearCookies();
        }
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;