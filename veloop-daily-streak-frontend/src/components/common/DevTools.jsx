import { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { timeTravel, timeReset } from '../../services/devApi';
import { useStreakData } from '../../context/StreakDataContext';
import { useToast } from '../../context/ToastContext';
import styles from './DevTools.module.css';

// Demo helper for the 24h timer and missed-day reset. Rendered only when the
// frontend is built with VITE_ENABLE_DEV_TOOLS=true, and it only works while the
// backend runs with ENABLE_DEV_TOOLS=true (never in production). It moves the
// SERVER clock — the browser clock is never touched or trusted.
const enabled = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';

export default function DevTools() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { reload } = useStreakData();
  const toast = useToast();

  if (!enabled) return null;

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      toast.info(okMsg);
      await reload({ silent: true });
    } catch (err) {
      toast.error(err?.code === 'NOT_FOUND' ? 'Dev tools are off on the server (ENABLE_DEV_TOOLS=false).' : err?.message || 'Failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.dock}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.head}>
            <span>Server time travel</span>
            <button className={styles.x} onClick={() => setOpen(false)} aria-label="Close dev tools">
              <X size={14} />
            </button>
          </div>
          <div className={styles.row}>
            {[1, 24, 48].map((h) => (
              <button key={h} disabled={busy} onClick={() => run(() => timeTravel(h), `Server clock +${h}h`)}>
                +{h}h
              </button>
            ))}
            <button disabled={busy} onClick={() => run(timeReset, 'Server clock reset')}>
              Reset
            </button>
          </div>
          <div className={styles.hint}>+24h unlocks the next day · +48h after a claim triggers the missed-day reset.</div>
        </div>
      )}
      <button className={styles.fab} onClick={() => setOpen((v) => !v)} aria-label="Toggle dev tools" title="Dev tools">
        <FlaskConical size={18} />
      </button>
    </div>
  );
}
