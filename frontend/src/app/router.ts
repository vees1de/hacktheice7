import AccountPage from '@pages/AccountPage.vue';
import AuthPage from '@pages/AuthPage.vue';
import HomePage from '@pages/HomePage.vue';
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/auth', component: AuthPage },
  { path: '/home', component: HomePage },
  { path: '/account', component: AccountPage },
  { path: '/', redirect: '/account' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
