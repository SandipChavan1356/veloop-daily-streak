import { Link } from 'react-router-dom';
import { Gem, IndianRupee } from 'lucide-react';
import { FlameSvg } from '../icons/RewardArt';
import styles from './StatPills.module.css';

// Small header chips. Values are passed in from backend state — never computed here.
export function StreakBadge({ days, to = '/daily-streak' }) {
  const n = days ?? 0;
  return (
    <Link to={to} className={`${styles.pill} ${styles.streak}`} title="Current streak" aria-label={`${n} day streak`}>
      <FlameSvg size={18} lit={n > 0} />
      <span className="tabular">{n}</span>
      <span className={styles.hideSm}>{n === 1 ? 'day' : 'days'}</span>
    </Link>
  );
}

export function GemPill({ value, to = '/rewards' }) {
  return (
    <Link to={to} className={`${styles.pill} ${styles.gem}`} title="VES balance" aria-label={`${value ?? 0} VES`}>
      <Gem size={15} />
      <span className="tabular">{value ?? '—'}</span>
    </Link>
  );
}

export function RupeePill({ value, to = '/rewards' }) {
  return (
    <Link to={to} className={`${styles.pill} ${styles.inr} ${styles.hideMd}`} title="Gift card balance" aria-label={`₹${value ?? 0} gift card balance`}>
      <IndianRupee size={14} />
      <span className="tabular">{value ?? 0}</span>
    </Link>
  );
}
