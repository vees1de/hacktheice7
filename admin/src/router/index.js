import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Dashboard from "../pages/Dashboard.vue";
import { pinia } from "../stores";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/login", name: "Login", component: Login },
  {
    path: "/",
    name: "Admin",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Проверка авторизации
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/login");
  }
  if (to.name === "Login" && auth.isAuthenticated) {
    return next("/");
  }
  next();
});

export default router;
