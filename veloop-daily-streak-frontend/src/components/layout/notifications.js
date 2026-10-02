// Turns BACKEND streak state into notification rows. Presentation only:
// every time and amount below is a field the API already returned.
export function buildNotifications(streak) {
  if (!streak) return [];
  const list = [];
  const fmt = (iso) =>
    new Date(iso).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });

  if (streak.wasReset) {
    list.push({
      id: 'reset',
      tone: 'red',
      title: 'Your streak was reset',
      body: 'A claim window was missed. Start again from Day 1.',
      to: '/daily-streak',
    });
  }
  if (streak.eligibleNow) {
    const r = streak.nextReward;
    list.push({
      id: 'ready',
      tone: 'gold',
      title: 'Your check-in is ready',
      body: r ? `Day ${streak.currentDay}: claim ${r.currency === 'INR' ? `₹${r.amount}` : `+${r.amount} ${r.currency}`} now.` : 'Claim it to protect your streak.',
      to: '/daily-streak',
    });
    if (streak.claimDeadline && streak.currentStreak > 0) {
      list.push({
        id: 'risk',
        tone: 'red',
        title: 'Streak at risk',
        body: `Claim before ${fmt(streak.claimDeadline)} or it resets.`,
        to: '/daily-streak',
      });
    }
  } else if (streak.nextClaimAt) {
    list.push({
      id: 'next',
      tone: 'violet',
      title: 'Next reward is locked in',
      body: `Day ${streak.currentDay} unlocks ${fmt(streak.nextClaimAt)}.`,
      to: '/daily-streak',
    });
  }
  return list;
}
