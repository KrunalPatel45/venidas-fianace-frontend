
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('vf_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function apiError(error) {
  const data = error.response?.data;

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];

    if (first) {
      return String(first);
    }
  }

  return data?.message || error.message || 'Request failed.';
}
