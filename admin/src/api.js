import axios from "axios";

const api = axios.create({
  baseURL: "https://bims14.ru/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  resolveShareToken: (token) =>
    api.post("/auth/share-token/resolve", { token }),
};

export default api;
