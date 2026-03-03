import api from './api';

// User-facing
export const createTicket = (data) => api.post('/support', data).then(r => r.data);
export const getUserTickets = () => api.get('/support').then(r => r.data);
export const getTicketById = (id) => api.get(`/support/${id}`).then(r => r.data);
export const addReply = (id, message) => api.post(`/support/${id}/replies`, { message }).then(r => r.data);

// Admin
export const adminGetTickets = (params) => api.get('/admin/support', { params }).then(r => r.data);
export const adminGetTicket = (id) => api.get(`/admin/support/${id}`).then(r => r.data);
export const adminUpdateTicket = (id, data) => api.put(`/admin/support/${id}`, data).then(r => r.data);
export const adminReply = (id, message) => api.post(`/admin/support/${id}/replies`, { message }).then(r => r.data);
export const adminGetStats = () => api.get('/admin/support/stats').then(r => r.data);
