import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig
} from 'axios';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens
} from './token.service';

//const API_BASE = 'http://localhost:8000/api';

const API_BASE = 'https://bims14.ru/api/';

let apiInstance: AxiosInstance | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach(resolve => resolve(token));
  refreshQueue = [];
};

const createAPIInstance = (): AxiosInstance => {
  if (apiInstance) return apiInstance;

  apiInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  apiInstance.interceptors.request.use(async config => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;
      const status = error.response?.status;

      if (status === 401 && !originalRequest?._retry) {
        if (isRefreshing) {
          return new Promise(resolve => {
            refreshQueue.push((token: string | null) => {
              if (token && originalRequest?.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiInstance!.request(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');

          const res = await axios.post(
            `${API_BASE}auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const newAccess = res.data?.accessToken as string | undefined;
          const newRefresh = res.data?.refreshToken as string | undefined;
          if (newAccess && newRefresh) {
            setTokens(newAccess, newRefresh);
            processQueue(newAccess);
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            }
            return apiInstance!.request(originalRequest);
          }
          throw new Error('Failed to refresh');
        } catch (refreshError) {
          await clearTokens();
          processQueue(null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return apiInstance;
};

export const apiRequest = async <T = unknown>(
  url: string,
  options: AxiosRequestConfig = {}
) => {
  const api = createAPIInstance();
  return api.request<T>({ url, ...options });
};
