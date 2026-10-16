
import { api } from './client';

export const monthlyInvestmentsApi = {
  list: (params = {}) =>
    api.get('/admin/monthly-investments', { params }),

  summary: (month) =>
    api.get('/admin/monthly-investments/summary', {
      params: { month },
    }),

  generate: (month) =>
    api.post('/admin/monthly-investments/generate', {
      month,
    }),

  receiveCash: (investmentId, paidAt) =>
    api.post(
      `/admin/monthly-investments/${investmentId}/pay`,
      {
        payment_method: 'cash',
        paid_at: paidAt,
      }
    ),

  pendingForMember: (month, userId) =>
    api.get('/admin/monthly-investments/member-pending', {
      params: {
        month,
        user_id: userId,
      },
    }),

  receiveBulkCash: (investmentIds, paidAt) =>
    api.post('/admin/monthly-investments/bulk-pay', {
      investment_ids: investmentIds,
      payment_method: 'cash',
      paid_at: paidAt,
    }),
};
