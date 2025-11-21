import { useAuthStore } from '@entities/auth';
import AdminPage from '@pages/AdminPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import AuthSberPage from '@pages/AuthSberPage.vue';
import AuthWelcomePage from '@pages/AuthWelcomePage.vue';
import BenefintsPage from '@pages/BenefitsPage.vue';
import ChatPage from '@pages/ChatPage.vue';
import HomePage from '@pages/HomePage.vue';
import ProfitPage from '@pages/ProfitPage.vue';
import RegistrationPage from '@pages/RegistrationPage.vue';
import SalesPage from '@pages/SalesPage.vue';
import UserPage from '@pages/UserPage/UserPage.vue';
import EditBenefits from '@pages/UserPage/childs/EditBenefits.vue';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: ROUTE_NAMES.WELCOME, component: AuthWelcomePage },
  { path: ROUTE_NAMES.AUTH, component: AuthPage },
  { path: ROUTE_NAMES.SBER, component: AuthSberPage },
  { path: ROUTE_NAMES.REGISTRATION, component: RegistrationPage },
  { path: ROUTE_NAMES.HOME, component: HomePage },
  {
    path: ROUTE_NAMES.USER,
    component: UserPage,
    children: [
      {
        path: ROUTE_NAMES.EDIT_BENEFITS,
        component: EditBenefits
      }
    ]
  },
  { path: ROUTE_NAMES.CHAT, component: ChatPage },
  { path: ROUTE_NAMES.SALES, component: SalesPage },
  { path: ROUTE_NAMES.BENEFITS, component: BenefintsPage },
  { path: ROUTE_NAMES.ADMIN, component: AdminPage },
  { path: ROUTE_NAMES.ROOT, redirect: ROUTE_NAMES.WELCOME },
  { path: ROUTE_NAMES.PROFITS, component: ProfitPage }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});

const PUBLIC_ROUTES = new Set<string>([
  ROUTE_NAMES.WELCOME,
  ROUTE_NAMES.AUTH,
  ROUTE_NAMES.SBER,
  ROUTE_NAMES.REGISTRATION
]);

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  try {
    if (!PUBLIC_ROUTES.has(to.path)) {
      await authStore.checkToken();
    }
  } catch {
    // space
  }

  if (!isAuthenticated.value && !PUBLIC_ROUTES.has(to.path)) {
    next({ path: ROUTE_NAMES.WELCOME });
  } else {
    next();
  }
});

export default router;
