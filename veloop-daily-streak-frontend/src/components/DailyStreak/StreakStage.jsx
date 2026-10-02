import { Fragment } from 'react';
import Asset from '../common/Asset';
import StreakCore from './StreakCore';
import TodayDrop from './TodayDrop';
import { earnedTotals, pad2 } from '../../utils/streakState';
import { rewardLabel } from '../../utils/format';
import styles from './StreakStage.module.css';

const mood = ({ completed, streak, claimable }) =>
  completed ? 'The chain is complete.' : claimable ? "Today's drop is waiting." : streak.currentStreak > 0 ? 'Secured. See you when the timer ends.' : 'Start the chain today.';

// Asymmetric stage: identity (left) · the Core (centre) · today's drop (right).
// No enclosing card — the three live directly on the page atmosphere.
export default function StreakStage({ streak, rewards, serverTime, onClaim, claiming, completed, onTimerComplete, burstKey, notices }) {
  const claimable = rewards.some((r) => r.isToday && r.status === 'AVAILABLE');
  const earned = earnedTotals(rewards);
  const banked = [earned.ves ? `+${earned.ves} VES` : null, earned.inr ? `₹${earned.inr}` : null].filter(Boolean).join('  ·  ') || '—';
  const days = streak.currentStreak ?? 0;

  const rows = [
    ['Chain', `${days} ${days === 1 ? 'day' : 'days'}`],
    ['Banked', banked],
    ['Next unlock', streak.nextReward ? rewardLabel(streak.nextReward) : '—'],
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <aside className={`${styles.ident} vl-reveal`} style={{ '--i': 0 }}>
          <div className={styles.kicker}>Your streak</div>
          <div className={`${styles.big} tabular`}>
            {pad2(streak.currentDay)}<i>/{pad2(streak.totalRewards)}</i>
          </div>
          <p className={styles.mood}>{mood({ completed, streak, claimable })}</p>

          <dl className={styles.rows}>
            {rows.map(([k, v]) => (
              <Fragment key={k}>
                <dt>{k}</dt>
                <dd className="tabular">{v}</dd>
              </Fragment>
            ))}
          </dl>
          <Asset name="biggerStreak" className={styles.growth} />
          {notices}
        </aside>

        <div className={`${styles.core} vl-reveal`} style={{ '--i': 1 }}>
          <StreakCore streak={streak} rewards={rewards} burstKey={burstKey} />
        </div>

        <div className={`${styles.drop} vl-reveal`} style={{ '--i': 2 }}>
          <TodayDrop
            streak={streak}
            rewards={rewards}
            serverTime={serverTime}
            onClaim={onClaim}
            claiming={claiming}
            completed={completed}
            onTimerComplete={onTimerComplete}
          />
        </div>
      </div>
    </div>
  );
}
