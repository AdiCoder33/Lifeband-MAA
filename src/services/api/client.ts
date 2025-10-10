import axios from 'axios';
import {API_BASE} from '@env';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.warn(
        '[API]',
        error.response.status,
        error.response.config.url,
        error.response.data,
      );
    } else {
      console.warn('[API]', error.message);
    }
    return Promise.reject(error);
  },
);
