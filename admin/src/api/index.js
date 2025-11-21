import axios from "axios";

const API_BASE =
  import.meta.env?.VITE_ADMIN_API_BASE || "https://bims14.ru/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Подставляем токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Если 401 → выходим
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.log("error gg");
      //   localStorage.removeItem("adminAccessToken");
      //   window.location.href = "/admin/login";
    }
    throw err;
  }
);

export default api;
