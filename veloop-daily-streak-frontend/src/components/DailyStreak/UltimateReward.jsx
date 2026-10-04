import { useRef } from 'react';
import { Check, Lock } from 'lucide-react';
import Asset from '../common/Asset';
import { useInView } from '../../hooks/useInView';
import { rewardAmount } from '../../utils/format';
import { rewardUnit, pad2 } from '../../utils/streakState';
import styles from './UltimateReward.module.css';

const canTilt = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

// The destination. Giant outlined "07" behind a crown that tilts toward the cursor,
// a light sweep across it, notch progress underneath. Amount / type / unlock day /
// progress all come from the backend payload.
export default function UltimateReward({ reward, unlockDay, isClaimed, checkedIn }) {
  const root = useRef(null);
  const inView = useInView(root);
  if (!reward) return null;
  const left = Math.max(0, (unlockDay || 0) - (checkedIn || 0));

  const move = (e) => {
    const el = root.current;
    if (!el || !canTilt()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const leave = () => { root.current?.style.setProperty('--px', 0); root.current?.style.setProperty('--py', 0); };

  return (
    <section ref={root} data-paused={!inView} className={`${styles.final} ${isClaimed ? styles.won : ''}`} aria-labelledby="final-title" onPointerMove={move} onPointerLeave={leave}>
      <span className={styles.giant} aria-hidden="true">{pad2(unlockDay)}</span>
      <span className={styles.beam} aria-hidden="true" />

      <div className={styles.kicker}>Day {pad2(unlockDay)} · final vault</div>

      <div className={styles.stage} aria-hidden="true">
        <span className={styles.glow} />
        <div className={styles.tilt}>
          <Asset name="crown" className={styles.crown} sizes="(max-width: 760px) 78vw, 400px" />
        </div>
        <Asset name="exclusive" className={styles.gift} maxPx={110} />
      </div>

      <h2 id="final-title" className={styles.title}>
        <span className={`${styles.amount} tabular`}>{rewardAmount(reward)}</span>
        <span className={styles.type}>{reward.subtitle || rewardUnit(reward)}</span>
      </h2>

      <div className={styles.prog}>
        <ol className={styles.notches} aria-label={`${Math.min(checkedIn, unlockDay)} of ${unlockDay} days secured`}>
          {Array.from({ length: unlockDay || 0 }).map((_, i) => (<li key={i} className={i < checkedIn ? styles.on : i === checkedIn && !isClaimed ? styles.now : ''} style={{ '--i': i }} />))}
        </ol>
        <p className={styles.line}>
          {isClaimed ? <><Check size={15} strokeWidth={3} /> Unlocked on Day {pad2(unlockDay)}.</> : <><Lock size={14} /> <b className="tabular">{pad2(left)}</b> {left === 1 ? 'day' : 'days'} to go. Keep the chain unbroken.</>}
        </p>
      </div>
    </section>
  );
}
