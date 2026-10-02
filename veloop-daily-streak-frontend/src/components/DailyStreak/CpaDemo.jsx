import { useEffect, useState } from 'react';
import { ShieldCheck, Check, RotateCcw, Megaphone } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import styles from './CpaDemo.module.css';

const STEPS = ['Securing your session', 'Verifying eligibility', 'Preparing wallet credit'];

// Placeholder for the real CPA/ad network (doc sections 7, 68). Purely visual —
// it grants nothing. The backend session from /claim/initiate is what gates the
// real /claim call once the minimum wait passes. The VELoop team swaps this out later.
export default function CpaDemo({ minWaitSeconds = 3 }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 80);
    return () => clearInterval(id);
  }, []);

  const frac = Math.min(1, elapsed / Math.max(minWaitSeconds, 1));
  const active = Math.min(STEPS.length - 1, Math.floor(frac * STEPS.length));

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Reward verification">
      <div className={styles.card}>
        <ProgressRing value={frac} size={104} stroke={7}>
          <ShieldCheck size={30} color="#ffd977" />
        </ProgressRing>
        <div className={styles.title}>Preparing your reward…</div>
        <div className={styles.sub}>Advertisement / Reward Verification</div>

        <div className={styles.adSlot} aria-label="Advertisement placeholder">
          <Megaphone size={18} />
          <div>
            <b>Ad space</b>
            <span>Demo placeholder — the live CPA offer is plugged in here later.</span>
          </div>
        </div>

        <ul className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s} className={i < active || frac >= 1 ? styles.done : i === active ? styles.now : ''}>
              <span className={styles.ico}>{i < active || frac >= 1 ? <Check size={12} strokeWidth={3.4} /> : i === active ? <RotateCcw size={12} className={styles.spin} /> : null}</span>
              {s}
            </li>
          ))}
        </ul>
        <div className={styles.badge}>Please wait…</div>
      </div>
    </div>
  );
}
