const asyncHandler = require('../utils/asyncHandler');
const streakService = require('../services/streak.service');

const getDailyStreak = asyncHandler(async (req, res) => {
  res.json(await streakService.buildStatusResponse(req.user.id));
});

const getStatus = asyncHandler(async (req, res) => {
  res.json(await streakService.buildLightStatus(req.user.id));
});

const initiateClaim = asyncHandler(async (req, res) => {
  const { day } = req.body || {};
  res.json(await streakService.initiateClaim(req.user.id, day));
});

const claim = asyncHandler(async (req, res) => {
  const { day, sessionToken } = req.body || {};
  res.json(await streakService.claimReward(req.user.id, day, sessionToken));
});

const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  res.json(await streakService.getHistory(req.user.id, { page, limit }));
});

module.exports = { getDailyStreak, getStatus, initiateClaim, claim, getHistory };
