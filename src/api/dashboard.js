
import { api } from './client';

export const dashboardApi = {
  admin: () => api.get('/admin/dashboard'),
  member: () => api.get('/my/dashboard'),
  monthlyReport: (month) =>
    api.get('/admin/reports/monthly', {
      params: { month },
    }),
  society: () => api.get('/society/dashboard'),
};
