import { Check, Lock } from 'lucide-react';
import Asset from '../common/Asset';
import { rewardAmount } from '../../utils/format';
import { rewardUnit, pad2 } from '../../utils/streakState';
import styles from './UltimateReward.module.css';

// A destination, not a card: the Day-7 object on an orbit system with the
// exclusive gift circling it. Amount / type / unlock day / progress = backend data.
export default function UltimateReward({ reward, unlockDay, isClaimed, checkedIn }) {
  if (!reward) return null;
  const left = Math.max(0, (unlockDay || 0) - (checkedIn || 0));

  return (
    <div className={styles.wrap}>
    <section className={`${styles.final} ${isClaimed ? styles.won : ''}`} aria-labelledby="final-title">
      <div className={styles.copy}>
        <div className={styles.kicker}>Day {pad2(unlockDay)} · destination</div>
        <h2 id="final-title" className={styles.title}>Final vault</h2>
        <div className={styles.worth}>
          <span className={`${styles.amount} tabular`}>{rewardAmount(reward)}</span>
          <span className={styles.type}>{reward.subtitle || rewardUnit(reward)}</span>
        </div>
      </div>

      <div className={styles.orbitSys} aria-hidden="true">
        <span className={styles.glow} />
        <span className={`${styles.ring} ${styles.r1}`} />
        <span className={`${styles.ring} ${styles.r2}`} />
        <span className={`${styles.ring} ${styles.r3}`} />
        <span className={styles.sat}><Asset name="exclusive" className={styles.satImg} /></span>
        <Asset name="crown" className={styles.crown} />
      </div>

      <div className={styles.prog}>
        <div className={styles.count}>
          <span className={`${styles.left} tabular`}>{isClaimed ? <Check size={44} strokeWidth={2.4} /> : pad2(left)}</span>
          <span className={styles.leftCap}>{isClaimed ? 'Unlocked' : left === 1 ? 'day to go' : 'days to go'}</span>
        </div>
        <ol className={styles.dots} aria-label={`${Math.min(checkedIn, unlockDay)} of ${unlockDay} days secured`}>
          {Array.from({ length: unlockDay || 0 }).map((_, i) => (
            <li key={i} className={i < checkedIn ? styles.on : i === checkedIn && !isClaimed ? styles.now : ''} />
          ))}
        </ol>
        <p className={styles.rule}>
          {isClaimed ? <Check size={14} strokeWidth={3} /> : <Lock size={14} />}
          <span>{isClaimed ? `Opened on Day ${pad2(unlockDay)}.` : `Keep the chain unbroken to open it on Day ${pad2(unlockDay)}.`}</span>
        </p>
      </div>
    </section>
    </div>
  );
}
