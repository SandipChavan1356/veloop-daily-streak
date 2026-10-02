// Pure display helpers. They only FORMAT values the backend returned.

export const isMoney = (currency) => currency === 'INR';

/** "+10" for coins, "₹5" for gift cards — the big number on a reward card. */
export const rewardAmount = (reward) =>
  !reward ? '—' : isMoney(reward.currency) ? `₹${reward.amount}` : `+${reward.amount}`;

/** "+10 VES" / "₹5 gift card" — a full label. */
export const rewardLabel = (reward) =>
  !reward ? '—' : isMoney(reward.currency) ? `₹${reward.amount} gift card` : `+${reward.amount} VES`;

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '—';

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const timeAgo = (iso, now = Date.now()) => {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d}d ago`;
};

export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
