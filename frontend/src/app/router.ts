import { useAuthStore } from '@entities/auth';
import AccountPage from '@pages/AccountPage.vue';
import AdminPage from '@pages/AdminPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import BenefintsPage from '@pages/BenefitsPage.vue';
import ChatPage from '@pages/ChatPage.vue';
import HomePage from '@pages/HomePage.vue';
import RegistrationPage from '@pages/RegistrationPage.vue';
import SalesPage from '@pages/SalesPage.vue';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: ROUTE_NAMES.AUTH, component: AuthPage },
  { path: ROUTE_NAMES.REGISTRATION, component: RegistrationPage },
  { path: ROUTE_NAMES.HOME, component: HomePage },
  { path: ROUTE_NAMES.USER, component: AccountPage },
  { path: ROUTE_NAMES.CHAT, component: ChatPage },
  { path: ROUTE_NAMES.SALES, component: SalesPage },
  { path: ROUTE_NAMES.BENEFITS, component: BenefintsPage },
  { path: ROUTE_NAMES.ADMIN, component: AdminPage },
  { path: ROUTE_NAMES.ROOT, redirect: ROUTE_NAMES.AUTH }
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
