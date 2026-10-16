
import { api } from './client';

export const accountsApi = {
  // Get society accounts with pagination and search
  list: (params = {}) => {
    return api.get('/admin/accounts', {
      params,
    });
  },

  // Create a new society account
  create: (data) => {
    return api.post('/admin/accounts', {
      user_id: data.user_id,
      account_number: data.account_number,
      opened_at: data.opened_at,
    });
  },

  // Receive opening fee by CASH only
  receiveOpeningFee: (feeId, data = {}) => {
    return api.post(
      `/admin/opening-fees/${feeId}/pay`,
      {
        payment_method: 'cash',
        paid_at: data.paid_at,
      }
    );
  },
};
