import { useAuthStore } from '@entities/auth';
import AccountPage from '@pages/AccountPage.vue';
import AdminPage from '@pages/AdminPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import BenefintsPage from '@pages/BenefintsPage.vue';
import ChatPage from '@pages/ChatPage.vue';
import HomePage from '@pages/HomePage.vue';
import SalesPage from '@pages/SalesPage.vue';
import { storeToRefs } from 'pinia';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/auth', component: AuthPage },
  { path: '/home', component: HomePage },
  { path: '/user', component: AccountPage },
  { path: '/chat', component: ChatPage },
  { path: '/sales', component: SalesPage },
  { path: '/benefits', component: BenefintsPage },
  { path: '/admin', component: AdminPage },
  { path: '/', redirect: '/user' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  const hashToKeep = to.hash || from.hash;

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ path: '/auth', hash: hashToKeep });
  } else if (from.hash && !to.hash) {
    next({ ...to, hash: from.hash });
  } else {
    next();
  }
});

export default router;
