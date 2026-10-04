import StreakPass from './StreakPass';
import CouponStub from './CouponStub';
import { pad2 } from '../../utils/streakState';
import styles from './StreakStage.module.css';

const mood = ({ completed, streak, claimable }) =>
  completed ? 'The chain is complete.' : claimable ? 'Today’s drop is waiting.' : streak.currentStreak > 0 ? 'Secured. The next drop is on the clock.' : 'Start the chain today.';

// Hero: a headline, the Pass (left, big, 3D) and today's coupon (right).
export default function StreakStage({ streak, rewards, serverTime, onClaim, claimingDay, celebration, failDay, completed, onTimerComplete, notices }) {
  const claimable = rewards.some((r) => r.isToday && r.status === 'AVAILABLE');
  return (
    <div className={styles.stage}>
      <span className={styles.numeral} aria-hidden="true">{pad2(streak.currentDay)}</span>

      <header className={`${styles.head} vl-reveal`} style={{ '--i': 0 }}>
        <span className={styles.kicker}>VELoop · Streak pass</span>
        <h1 className={styles.title}>{mood({ completed, streak, claimable })}</h1>
      </header>

      <div className={styles.grid}>
        <div className={`${styles.pass} vl-reveal`} style={{ '--i': 1 }}>
          <StreakPass streak={streak} rewards={rewards} celebration={celebration} />
          {notices}
        </div>
        <div className={`${styles.coupon} vl-reveal`} style={{ '--i': 2 }}>
          <CouponStub
            streak={streak}
            rewards={rewards}
            serverTime={serverTime}
            onClaim={onClaim}
            claimingDay={claimingDay}
            celebration={celebration}
            failDay={failDay}
            completed={completed}
            onTimerComplete={onTimerComplete}
          />
        </div>
      </div>
    </div>
  );
}
