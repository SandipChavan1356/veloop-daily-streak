import api from './api';

// Minutes ahead of UTC (IST = 330). Only used by the backend to bucket the weekly
// chart into the user's local calendar days — it never affects a claim or reward.
const tzOffset = () => -new Date().getTimezoneOffset();

export const getOverview = () => api.get('/insights/overview', { params: { tzOffset: tzOffset() } }).then((r) => r.data);
export const getAchievements = () => api.get('/insights/achievements').then((r) => r.data);
export const getMilestones = () => api.get('/insights/milestones').then((r) => r.data);
export const getActivity = (page = 1, limit = 20) =>
  api.get('/insights/activity', { params: { page, limit } }).then((r) => r.data);
export const getLeaderboard = (limit = 10) => api.get('/insights/leaderboard', { params: { limit } }).then((r) => r.data);
