import axios from "axios";

const api = axios.create({
  baseURL: "https://bims14.ru/api",
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
      localStorage.removeItem("adminAccessToken");
      window.location.href = "/login";
    }
    throw err;
  }
);

export default api;
