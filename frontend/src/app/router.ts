import { useAuthStore, useBiometricStore } from '@entities/auth';
import AdminPage from '@pages/AdminPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import AuthSberPage from '@pages/AuthSberPage.vue';
import AuthSecurePage from '@pages/AuthSecurePage.vue';
import AuthWelcomePage from '@pages/AuthWelcomePage.vue';
import BenefitCategoryPage from '@pages/BenefitCategoryPage.vue';
import BenefitDetailPage from '@pages/BenefitDetailPage.vue';
import BenefintsPage from '@pages/BenefitsPage.vue';
import ChatPage from '@pages/ChatPage.vue';
import HomePage from '@pages/HomePage.vue';
import ProfitPage from '@pages/ProfitPage.vue';
import SimpleModePage from '@pages/SimpleModePage.vue';
import RegistrationPage from '@pages/RegistrationPage.vue';
import SalesPage from '@pages/SalesPage.vue';
import AuthLockPage from '@pages/AuthLockPage.vue';
import UserPage from '@pages/UserPage/UserPage.vue';
import AppSettings from '@pages/UserPage/childs/AppSettings.vue';
import EditBenefits from '@pages/UserPage/childs/EditBenefits.vue';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const LAST_ACTIVITY_KEY = 'lasso:lastActivity';
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const routes: Array<RouteRecordRaw> = [
  { path: ROUTE_NAMES.WELCOME, component: AuthWelcomePage },
  { path: ROUTE_NAMES.AUTH, component: AuthPage },
  { path: ROUTE_NAMES.SBER, component: AuthSberPage },
  { path: ROUTE_NAMES.SECURE, component: AuthSecurePage },
  { path: ROUTE_NAMES.LOCK, component: AuthLockPage },
  { path: ROUTE_NAMES.REGISTRATION, component: RegistrationPage },
  { path: ROUTE_NAMES.HOME, component: HomePage },
  {
    path: ROUTE_NAMES.USER,
    component: UserPage,
    children: [
      {
        path: ROUTE_NAMES.EDIT_BENEFITS,
        component: EditBenefits
      },
      {
        path: ROUTE_NAMES.USER_SETTINGS,
        component: AppSettings
      }
    ]
  },
  { path: ROUTE_NAMES.CHAT, component: ChatPage },
  { path: ROUTE_NAMES.SALES, component: SalesPage },
  { path: ROUTE_NAMES.BENEFITS, component: BenefintsPage },
  { path: ROUTE_NAMES.BENEFITS_CATEGORY, component: BenefitCategoryPage },
  { path: ROUTE_NAMES.BENEFIT_DETAIL, component: BenefitDetailPage },
  { path: ROUTE_NAMES.ADMIN, component: AdminPage },
  { path: ROUTE_NAMES.SIMPLE, component: SimpleModePage },
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
  ROUTE_NAMES.REGISTRATION,
  ROUTE_NAMES.SECURE,
  ROUTE_NAMES.LOCK
]);

const markActivity = () => {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch {
    // ignore storage issues
  }
};

const isIdle = () => {
  try {
    const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    if (!last) return false;
    return Date.now() - last > IDLE_TIMEOUT_MS;
  } catch {
    return false;
  }
};

if (typeof window !== 'undefined') {
  ['click', 'keydown', 'touchstart', 'mousemove', 'visibilitychange'].forEach(
    event =>
      window.addEventListener(event, () => {
        if (document.visibilityState === 'hidden') return;
        markActivity();
      })
  );
  markActivity();
}

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const biometricStore = useBiometricStore();
  const { isAuthenticated } = storeToRefs(authStore);

  try {
    await biometricStore.loadFromStorage();
  } catch {
    // ignore
  }

  const hasQuickAccess =
    Boolean(biometricStore.meta?.phone) ||
    Boolean(
      (biometricStore as any).isPinSet?.value ?? (biometricStore as any).pinHash
    );

  if (to.path === ROUTE_NAMES.WELCOME && hasQuickAccess && !isAuthenticated.value) {
    next({ path: ROUTE_NAMES.LOCK });
    return;
  }

  try {
    if (!PUBLIC_ROUTES.has(to.path)) {
      await authStore.checkToken();
    }
  } catch {
    // space
  }

  const idle =
    isAuthenticated.value &&
    to.path !== ROUTE_NAMES.LOCK &&
    to.path !== ROUTE_NAMES.SECURE &&
    !PUBLIC_ROUTES.has(to.path) &&
    isIdle();
  if (idle) {
    next({ path: ROUTE_NAMES.LOCK });
    return;
  }

  markActivity();

  if (
    to.path === ROUTE_NAMES.SECURE &&
    (!isAuthenticated.value || hasQuickAccess)
  ) {
    next({ path: hasQuickAccess ? ROUTE_NAMES.LOCK : ROUTE_NAMES.WELCOME });
    return;
  }

  if (
    to.path === ROUTE_NAMES.LOCK &&
    !hasQuickAccess &&
    !isAuthenticated.value
  ) {
    next({ path: ROUTE_NAMES.WELCOME });
    return;
  }

  if (!isAuthenticated.value && !PUBLIC_ROUTES.has(to.path)) {
    next({ path: ROUTE_NAMES.WELCOME });
  } else {
    next();
  }
});

export default router;
