import { useAuthStore } from '@entities/auth';
import AccountPage from '@pages/AccountPage.vue';
import AdminPage from '@pages/AdminPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import BenefintsPage from '@pages/BenefintsPage.vue';
import ChatPage from '@pages/ChatPage.vue';
import HomePage from '@pages/HomePage.vue';
import RegistrationPage from '@pages/RegistrationPage.vue';
import SalesPage from '@pages/SalesPage.vue';
import { storeToRefs } from 'pinia';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/auth', component: AuthPage },
  { path: '/registration', component: RegistrationPage },
  { path: '/home', component: HomePage },
  { path: '/user', component: AccountPage },
  { path: '/chat', component: ChatPage },
  { path: '/sales', component: SalesPage },
  { path: '/benefits', component: BenefintsPage },
  { path: '/admin', component: AdminPage },
  { path: '/', redirect: '/auth' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  try {
    if (to.path !== '/auth' && to.path !== '/registration') {
      await authStore.checkToken();
    }
  } catch {
    // space
  }

  if (
    !isAuthenticated.value &&
    to.path !== '/auth' &&
    to.path !== '/registration'
  ) {
    next({ path: '/auth' });
  } else {
    next();
  }
});

export default router;
