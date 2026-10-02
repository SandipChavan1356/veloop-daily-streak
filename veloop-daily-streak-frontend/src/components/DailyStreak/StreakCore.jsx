import { useEffect, useId, useRef, useState } from 'react';
import Asset from '../common/Asset';
import { useCountUp } from '../../hooks/useCountUp';
import { dayState, pad2 } from '../../utils/streakState';
import styles from './StreakCore.module.css';

const GAP = 2.4; // % of the ring left open between segments

// The streak, as an object: a 7-segment energy ring (one arc per backend day),
// a dark core holding the live number, and the flame rising out of the top.
export default function StreakCore({ streak, rewards, burstKey }) {
  const gid = useId().replace(/:/g, '');
  const days = streak.currentStreak ?? 0;
  const shown = useCountUp(days, { duration: 1100 });
  const n = rewards.length || streak.totalRewards || 7;
  const seg = 100 / n - GAP;

  const prev = useRef(days);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (days > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 1000);
      prev.current = days;
      return () => clearTimeout(t);
    }
    prev.current = days;
    return undefined;
  }, [days]);

  return (
    <div
      className={`${styles.core} ${days > 0 ? styles.lit : styles.cold} ${bump ? styles.bump : ''}`}
      role="img"
      aria-label={`Streak: ${days} ${days === 1 ? 'day' : 'days'}. Day ${streak.currentDay} of ${streak.totalRewards}.`}
    >
      <span className={styles.aura} />
      <span className={styles.orbitA}><i /></span>
      <span className={styles.orbitB}><i /></span>

      <svg className={styles.ring} viewBox="0 0 400 400">
        <defs>
          <linearGradient id={`${gid}-g`} gradientUnits="userSpaceOnUse" x1="40" y1="360" x2="360" y2="40">
            <stop offset="0" stopColor="#38d5ff" />
            <stop offset="1" stopColor="#ffd977" />
          </linearGradient>
        </defs>
        <circle className={styles.track} cx="200" cy="200" r="150" />
        {rewards.map((card, i) => {
          const st = dayState(card);
          return (
            <circle
              key={card.day}
              className={`${styles.seg} ${styles[st]}`}
              cx="200"
              cy="200"
              r="150"
              pathLength="100"
              strokeDasharray={`${seg} ${100 - seg}`}
              transform={`rotate(${-90 + (i * 360) / n + GAP * 1.8} 200 200)`}
              style={{ '--i': i, ...(st === 'claimed' ? { stroke: `url(#${gid}-g)` } : null) }}
            />
          );
        })}
      </svg>

      <div className={styles.disc}>
        <Asset name="flame" className={styles.flame} eager />
        <div className={`${styles.num} tabular`}>{shown}</div>
        <div className={styles.cap}>{days === 1 ? 'day' : 'days'} in</div>
        <div className={`${styles.where} tabular`}>
          Day {pad2(streak.currentDay)} <i>/</i> {pad2(streak.totalRewards)}
        </div>
      </div>

      <Asset name="stayActive" className={styles.satCal} />
      <Asset name="coin" className={styles.satCoin} />
      <i className={`${styles.spark} ${styles.sp1}`} />
      <i className={`${styles.spark} ${styles.sp2}`} />
      {burstKey ? <span key={burstKey} className={styles.shock} /> : null}
    </div>
  );
}
