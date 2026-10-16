
import { api } from './client';

export const loansApi = {
  list: (params = {}) =>
    api.get('/admin/loans', { params }),

  summary: () =>
    api.get('/admin/loans/summary'),

  details: (id) =>
    api.get(`/admin/loans/${id}`),

  create: (data) =>
    api.post('/admin/loans', {
      ...data,
      disbursement_method: 'cash',
    }),

  generateInterest: (month) =>
    api.post('/admin/loans/interest/generate', {
      month,
    }),

  interestList: (params = {}) =>
    api.get('/admin/loans/interest', { params }),

  receiveInterest: (id, paidAt) =>
    api.post(`/admin/loans/interest/${id}/pay`, {
      payment_method: 'cash',
      paid_at: paidAt,
    }),

  repayPrincipal: (id, data) =>
    api.post(`/admin/loans/${id}/repay-principal`, {
      ...data,
      payment_method: 'cash',
    }),

  members: (params = {}) =>
    api.get('/admin/members', { params }),

  borrowers: (params = {}) =>
    api.get('/admin/loan-borrowers', { params }),

  // External Borrower Management

  externalBorrowers: (params = {}) =>
    api.get('/admin/external-borrowers', {
      params,
    }),
  
  externalBorrowerDetails: (id, params = {}) =>
  api.get(`/admin/external-borrowers/${id}`, { params }),

  createExternalBorrower: (data) =>
    api.post('/admin/external-borrowers', data),

  updateExternalBorrower: (id, data) =>
    api.put(`/admin/external-borrowers/${id}`, data),

  activateExternalBorrower: (id) =>
    api.patch(
      `/admin/external-borrowers/${id}/activate`
    ),

  deactivateExternalBorrower: (id) =>
    api.patch(
      `/admin/external-borrowers/${id}/deactivate`
    ),
};
