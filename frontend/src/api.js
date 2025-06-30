import axios from "axios";
import { ACCESS_TOKEN, GOOGLE_ACCESS_TOKEN } from "./constants";
import Cookies from "js-cookie";

const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";

console.log("API Base URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const googleAccessToken = Cookies.get(GOOGLE_ACCESS_TOKEN);
    if (googleAccessToken) {
      config.headers["X-Google-Access-Token"] = googleAccessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      Cookies.remove(ACCESS_TOKEN);
      Cookies.remove(GOOGLE_ACCESS_TOKEN);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;