import localForage from 'localforage';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const getAccessToken = async () => await localForage.getItem(ACCESS_KEY);
export const getRefreshToken = async () =>
  await localForage.getItem(REFRESH_KEY);

export const setTokens = async (access: string, refresh: string) => {
  await localForage.setItem(ACCESS_KEY, access);
  await localForage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = async () => {
  await localForage.removeItem(ACCESS_KEY);
  await localForage.removeItem(REFRESH_KEY);
};
