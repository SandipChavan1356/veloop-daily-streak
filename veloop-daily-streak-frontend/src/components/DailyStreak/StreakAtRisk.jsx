import { AlertTriangle } from 'lucide-react';
import { useServerCountdown } from '../../hooks/useServerCountdown';
import styles from './StreakBanners.module.css';

// Shown while a claim is available AND a streak is at stake. The deadline is the
// backend's `claimDeadline`; the countdown is anchored to server time.
export default function StreakAtRisk({ streak, serverTime, onExpire }) {
  const show = streak?.eligibleNow && streak?.claimDeadline && streak?.currentStreak > 0;
  const cd = useServerCountdown(show ? serverTime : null, show ? streak.claimDeadline : null, { onComplete: onExpire });
  if (!show) return null;
  return (
    <div className={`${styles.banner} ${styles.risk}`} role="alert">
      <span className={styles.icon}><AlertTriangle size={16} /></span>
      <div className={styles.text}>
        <b>The chain is on the clock.</b> Claim today to keep your {streak.currentStreak}-day run alive.
      </div>
      <span className={`${styles.time} tabular`}>{cd.label}</span>
    </div>
  );
}
