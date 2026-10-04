import { useEffect, useState } from 'react';
import styles from './Odometer.module.css';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ d, ms }) {
  return (
    <span className={styles.col}>
      <span className={styles.strip} style={{ transform: `translateY(${-d * 10}%)`, transitionDuration: `${ms}ms` }}>
        {DIGITS.map((n) => (<span key={n}>{n}</span>))}
      </span>
    </span>
  );
}

// Rolling digits (mechanical-counter feel). Pass a number (`value`, zero-padded to
// `min`) or a ready string like "04:59:58" (`text`). Digits roll on every change;
// on mount they roll up from 0. Only a CSS transform animates.
export default function Odometer({ value, text, min = 1, ms = 900, className = '' }) {
  const str = text ?? String(Math.max(0, Math.round(value ?? 0))).padStart(min, '0');
  const [shown, setShown] = useState(() => str.replace(/\d/g, '0'));
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(str));
    return () => cancelAnimationFrame(id);
  }, [str]);
  return (
    <span className={`${styles.odo} ${className}`} role="img" aria-label={str}>
      {[...shown].map((ch, i) => (/\d/.test(ch) ? <Digit key={shown.length - i} d={+ch} ms={ms} /> : <span key={`s${i}`} className={styles.sep}>{ch}</span>))}
    </span>
  );
}
