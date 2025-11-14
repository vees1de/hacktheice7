import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

import HomePage from './pages/HomePage.vue';

const routes: Array<RouteRecordRaw> = [{ path: '/', component: HomePage }];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, _from, next) => {
  to;
  // const authStore = useAuthStore();
  // if (authStore.isAuthenticated === false && !authStore.user) {
  //   await authStore.fetchUser();
  // }
  // if (to.meta.requiresAuth && !authStore.isAuthenticated) {
  //   next('/auth');
  // } else {
  //   next();
  // }
  next();
});

export default router;
