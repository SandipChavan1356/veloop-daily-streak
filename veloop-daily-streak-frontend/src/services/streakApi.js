import api from './api';

// Centralized API layer (doc section 88) — components never call axios directly.
export const getDailyStreak = () => api.get('/daily-streak').then((r) => r.data);
export const getStatus = () => api.get('/daily-streak/status').then((r) => r.data);
export const initiateClaim = (day) => api.post('/daily-streak/claim/initiate', { day }).then((r) => r.data);
export const claimReward = (day, sessionToken) =>
  api.post('/daily-streak/claim', { day, sessionToken }).then((r) => r.data);
export const getHistory = (page = 1, limit = 20) =>
  api.get('/daily-streak/history', { params: { page, limit } }).then((r) => r.data);
export const getWallet = () => api.get('/wallet').then((r) => r.data);
export const getWalletTransactions = (page = 1, limit = 20) =>
  api.get('/wallet/transactions', { params: { page, limit } }).then((r) => r.data);
