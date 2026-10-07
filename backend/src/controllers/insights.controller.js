const asyncHandler = require('../utils/asyncHandler');
const insights = require('../services/insights.service');



const overview = asyncHandler(async (req, res) => {
  res.json(await insights.getOverview(req.user.id, { tzOffset: req.query.tzOffset }));
});

const achievements = asyncHandler(async (req, res) => {
  res.json(await insights.getAchievements(req.user.id));
});

const milestones = asyncHandler(async (req, res) => {
  res.json(await insights.getMilestones(req.user.id));
});

const activity = asyncHandler(async (req, res) => {
  res.json(await insights.getActivity(req.user.id, { page: req.query.page, limit: req.query.limit }));
});

const leaderboard = asyncHandler(async (req, res) => {
  res.json(await insights.getLeaderboard(req.user.id, { limit: req.query.limit }));
});

module.exports = { overview, achievements, milestones, activity, leaderboard };
