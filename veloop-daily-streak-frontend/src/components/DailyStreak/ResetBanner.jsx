import { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import styles from './StreakBanners.module.css';

export default function ResetBanner({ streak }) {
  const [hidden, setHidden] = useState(false);
  if (!streak?.wasReset || hidden) return null;
  return (
    <div className={`${styles.banner} ${styles.reset}`} role="status">
      <span className={styles.icon}><RotateCcw size={18} /></span>
      <div className={styles.text}>
        <b>The chain reset.</b> Day 01 is open — every long run starts with one claim.
      </div>
      <button className={styles.dismiss} onClick={() => setHidden(true)} aria-label="Dismiss"><X size={16} /></button>
    </div>
  );
}
