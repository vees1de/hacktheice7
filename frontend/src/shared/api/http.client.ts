import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

let apiInstance: AxiosInstance | null = null;
const token = '';

// const loadConfigClosure = () => {
//   let promise: Promise<AxiosResponse<{ apiBaseUrl: string }>> | null = null;

//   return function () {
//     if (promise) {
//       return promise;
//     } else {
//       try {
//         promise = axios.get('/assets/config.json', {
//           headers: {
//             'Cache-Control': 'no-cache, no-store, must-revalidate',
//             Pragma: 'no-cache',
//             Expires: '0'
//           }
//         });
//       } catch (error) {
//         console.error('Error loading configuration:', error);
//         throw new Error('Failed to load configuration');
//       }
//       return promise;
//     }
//   };
// };

// const loadConfig = loadConfigClosure();

const createAPIInstance = async (): Promise<AxiosInstance> => {
  if (apiInstance) {
    return apiInstance;
  }

  apiInstance = axios.create({
    baseURL: 'https/bims14.ru/api',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  apiInstance.interceptors.request.use(config => {
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return apiInstance;
};

export const apiRequest = async (
  url: string,
  options: AxiosRequestConfig = {}
) => {
  const api = await createAPIInstance();
  return api.request({ url, ...options });
};
