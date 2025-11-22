export const ROUTE_NAMES = {
  WELCOME: '/auth',
  AUTH: '/auth/login',
  SBER: '/auth/sberid',
  REGISTRATION: '/auth/register',
  HOME: '/home',
  USER: '/user',
  EDIT_BENEFITS: '/user/edit-benefits',
  USER_SETTINGS: '/user/settings',
  CHAT: '/chat',
  SALES: '/sales',
  BENEFITS: '/benefits',
  BENEFITS_CATEGORY: '/benefits/category/:categoryType',
  BENEFIT_DETAIL: '/benefits/:benefitId',
  ADMIN: '/admin',
  PROFITS: '/profits',
  ROOT: '/'
} as const;
