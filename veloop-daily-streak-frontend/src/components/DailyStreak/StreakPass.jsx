import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';
import PassCard from './PassCard';
import { useAuth } from '../../context/AuthContext';
import { ASSET_FOR_TYPE } from '../../assets/veloop';
import { dayState, isVipCard, earnedTotals, pad2 } from '../../utils/streakState';
import { rewardLabel } from '../../utils/format';
import styles from './StreakPass.module.css';

// The Pass wired to backend data: slot states come from `rewards`, the number from
// `streak`. The back face is the ledger (secured / next unlock / sealed).
export default function StreakPass({ streak, rewards, celebration }) {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const celDay = celebration?.day ?? null;
  const [slamDay, setSlamDay] = useState(null); // sticky: the slam must not restart when the celebration ends
  useEffect(() => {
    if (celDay != null) setSlamDay(celDay);
  }, [celDay]);

  // a claim flips the card back to its front so the stamp lands where you can see it
  useEffect(() => {
    if (celDay != null) setFlipped(false);
  }, [celDay]);

  const slots = rewards.map((c) => {
    const fresh = slamDay === c.day;
    return { day: c.day, state: fresh ? 'claimed' : dayState(c), vip: isVipCard(c), fresh, art: ASSET_FOR_TYPE[c.reward?.assetType] || 'coin' };
  });

  const earned = earnedTotals(rewards);
  const next = rewards.find((r) => r.isToday && r.status !== 'CLAIMED') || rewards.find((r) => r.status !== 'CLAIMED');
  const sealed = rewards.filter((r) => r.status !== 'CLAIMED' && r !== next).length;
  const banked = [earned.ves ? `+${earned.ves} VES` : null, earned.inr ? `₹${earned.inr}` : null].filter(Boolean).join(' · ') || '—';

  const back = (
    <dl className={styles.ledger}>
      <div><dt>Secured</dt><dd className="tabular">{banked}</dd><small className="tabular">{pad2(earned.count)} / {pad2(rewards.length)} drops</small></div>
      <div><dt>Next unlock</dt><dd className="tabular">{next ? rewardLabel(next.reward) : '—'}</dd><small className="tabular">{next ? `Day ${pad2(next.day)}` : 'all claimed'}</small></div>
      <div><dt>Sealed</dt><dd className="tabular">{pad2(sealed)}</dd><small>still locked</small></div>
    </dl>
  );

  return (
    <div className={styles.root}>
      <PassCard
        slots={slots}
        holder={user?.username || 'Member'}
        day={streak.currentDay}
        total={streak.totalRewards}
        days={streak.currentStreak ?? 0}
        flipped={flipped}
        back={back}
        shakeKey={celebration?.key ?? null}
      />
      <div className={styles.row}>
        <button className={styles.flip} onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>
          <RotateCw size={15} /> {flipped ? 'Back to pass' : 'Flip for ledger'}
        </button>
        <span className={styles.hint}>move to tilt</span>
      </div>
    </div>
  );
}
