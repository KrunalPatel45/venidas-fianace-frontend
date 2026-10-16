
import { api } from './client';

export const authApi = {
  login: (email, password) => {
    return api.post('/login', {
      email,
      password,
    });
  },

  me: () => api.get('/me'),

  logout: () => api.post('/logout'),

  changePassword: (data) => {
    return api.post('/change-password', data);
  },
};
