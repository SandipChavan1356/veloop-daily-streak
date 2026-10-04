import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { isMoney } from '../../utils/format';
import styles from './ClaimToast.module.css';

const LIFE = 5200;

// Premium success message. Rendered ONLY from the backend's claim response:
// the amount/currency are exactly what the API returned.
export default function ClaimToast({ reward, day, onDetails, onClose }) {
  const [leaving, setLeaving] = useState(false);
  const money = isMoney(reward.currency);

  const close = () => {
    setLeaving(true);
    setTimeout(onClose, 240);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 240);
    }, LIFE);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`${styles.toast} ${leaving ? styles.out : ''}`} role="status" aria-live="polite">
      <span className={styles.icon}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" />
        </svg>
      </span>
      <div className={styles.text}>
        <b>Reward claimed!</b>
        <span className="tabular">
          {money ? `₹${reward.amount} gift card credited` : `+${reward.amount} ${reward.currency} added`}
          <i> · Day {day}</i>
        </span>
      </div>
      {onDetails && (
        <button className={styles.details} onClick={onDetails}>Details</button>
      )}
      <button className={styles.x} onClick={close} aria-label="Dismiss"><X size={16} /></button>
      <span className={styles.life} aria-hidden="true" style={{ animationDuration: `${LIFE}ms` }} />
    </div>
  );
}
