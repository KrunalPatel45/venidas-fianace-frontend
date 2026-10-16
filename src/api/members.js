import { api } from './client';

export const membersApi = {
  list: (params = {}, config = {}) =>
    api.get('/admin/members', { params, ...config }),

  show: id =>
    api.get(`/admin/members/${id}`),

  create: data =>
    api.post('/admin/members', data),

  update: (id, data) =>
    api.put(`/admin/members/${id}`, data),

  deactivate: id =>
    api.delete(`/admin/members/${id}`),
};