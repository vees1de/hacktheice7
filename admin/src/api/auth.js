import api from "./index";

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  resolveShareToken: (token) =>
    api.post("/auth/share-token/resolve", { token }),
};
