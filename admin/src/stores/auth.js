import { defineStore } from "pinia";

const STORAGE_KEY = "adminAccessToken";
const NAME_KEY = "adminName";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(STORAGE_KEY) || "",
    adminName: localStorage.getItem(NAME_KEY) || "Админ",
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setAuth(token, userName = "Админ") {
      this.token = token;
      this.adminName = userName;
      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(NAME_KEY, userName);
    },
    clearAuth() {
      this.token = "";
      this.adminName = "Админ";
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NAME_KEY);
    },
  },
});
