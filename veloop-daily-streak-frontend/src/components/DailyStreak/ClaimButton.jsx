import { AlertCircle, Sparkles } from 'lucide-react';
import styles from './ClaimButton.module.css';

// The one claim control (hero drop, trail inspector, vertical trail).
// state: 'idle' → 'loading' (request in flight) → 'success' (backend confirmed)
//        or 'error' (backend refused: stays clickable so the user can retry).
// All four labels share one grid cell, so the button never changes size mid-morph.
export default function ClaimButton({ state = 'idle', onClick, size = 'lg', label = 'Claim reward', className = '' }) {
  const locked = state === 'loading' || state === 'success';
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[size]} ${styles[state]} ${className}`}
      onClick={onClick}
      disabled={locked}
      aria-busy={state === 'loading' || undefined}
    >
      <span className={`${styles.bg} ${styles.gold}`} />
      <span className={`${styles.bg} ${styles.green}`} />
      <span className={`${styles.bg} ${styles.red}`} />
      <span className={`${styles.layer} ${styles.lIdle}`} aria-hidden={state !== 'idle'}>
        <Sparkles size={size === 'sm' ? 15 : 18} /> {label}
      </span>
      <span className={`${styles.layer} ${styles.lLoad}`} aria-hidden={state !== 'loading'}>
        <span className={styles.spinner} /> Claiming…
      </span>
      <span className={`${styles.layer} ${styles.lOk}`} aria-hidden={state !== 'success'}>
        <svg className={styles.check} viewBox="0 0 24 24" width={size === 'sm' ? 16 : 20} height={size === 'sm' ? 16 : 20} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" />
        </svg>
        Reward claimed
      </span>
      <span className={`${styles.layer} ${styles.lErr}`} aria-hidden={state !== 'error'}>
        <AlertCircle size={size === 'sm' ? 15 : 18} /> Try again
      </span>
    </button>
  );
}
