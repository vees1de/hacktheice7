import { useAuthStore } from '@entities/auth';
import AccountPage from '@pages/AccountPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import HomePage from '@pages/HomePage.vue';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/auth', component: AuthPage },
  { path: '/', component: HomePage },
  { path: '/account', component: AccountPage, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { handleAuthentication } = authStore;

  const isAuthenticated = handleAuthentication();

  const hashToKeep = to.hash || from.hash;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/auth', hash: hashToKeep });
  } else if (from.hash && !to.hash) {
    next({ ...to, hash: from.hash });
  } else {
    next();
  }
});

export default router;
