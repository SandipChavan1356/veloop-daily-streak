// Pure read-only derivations from the BACKEND's per-day fields.
// Nothing here decides eligibility — `status` and `isToday` come from the API.

/** 'claimed' | 'today' (claim available now) | 'waiting' (today's, timer running) | 'locked' */
export const dayState = (card) => {
  if (card.status === 'CLAIMED') return 'claimed';
  if (card.isToday && card.status === 'AVAILABLE') return 'today';
  if (card.isToday && card.status === 'LOCKED') return 'waiting';
  return 'locked';
};

export const isVipCard = (card) => card.reward?.assetType === 'crown' || card.reward?.badge === 'VIP';

/** "VES" for coins, "gift card" for money rewards. */
export const rewardUnit = (reward) => (!reward ? '' : reward.currency === 'INR' ? 'gift card' : reward.currency);

/** Totals of what the backend says is already CLAIMED (display-only sum). */
export const earnedTotals = (rewards = []) =>
  rewards.reduce(
    (t, r) => {
      if (r.status !== 'CLAIMED' || !r.reward) return t;
      if (r.reward.currency === 'INR') t.inr += r.reward.amount;
      else t.ves += r.reward.amount;
      t.count += 1;
      return t;
    },
    { ves: 0, inr: 0, count: 0 },
  );

export const pad2 = (n) => String(n ?? 0).padStart(2, '0');
