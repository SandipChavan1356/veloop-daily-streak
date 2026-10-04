import { useMemo } from 'react';
import Asset from '../common/Asset';
import { ASSET_FOR_TYPE } from '../../assets/veloop';
import styles from './RewardVisual.module.css';

// particles per reveal: [count, travel distance in px at size 190]
const BURST = { coin: [10, 120], 'gift-card': [9, 120], 'gift-box': [13, 130], crown: [20, 160] };

function Burst({ kind, size }) {
  const [count, dist] = BURST[kind] || BURST.coin;
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: Math.round((360 / count) * i + (i % 2 ? 9 : -6)),
        d: Math.round((dist * (0.7 + ((i * 37) % 10) / 20) * size) / 190),
        t: (i % 4) * 45,
        s: 0.7 + ((i * 13) % 6) / 10,
        white: i % 3 === 0,
      })),
    [count, dist, size],
  );
  return (
    <>
      <span className={styles.glowRing} />
      {kind === 'crown' && <span className={styles.vipRays} />}
      {kind === 'gift-card' && <span className={styles.shineClip}><span className={styles.shine} /></span>}
      {parts.map((p, i) => (
        <i key={i} className={`${styles.part} ${p.white ? styles.white : ''}`} style={{ '--a': `${p.a}deg`, '--d': `${p.d}px`, '--t': `${p.t}ms`, '--sc': p.s }} />
      ))}
    </>
  );
}

// Each reward TYPE gets its own staging, so the system feels alive:
//   coin → rays, gift-card → perforated ticket, gift-box → sparkles, crown → orbit.
// `state`: 'open' | 'sealed'.  `reveal` (any truthy key) plays the one-shot
// "reward unlocked" sequence — it is only ever set after the backend confirmed a claim.
export default function RewardVisual({ type = 'coin', size = 140, state = 'open', float = true, priority = false, reveal = null, className = '' }) {
  const asset = ASSET_FOR_TYPE[type] || 'coin';
  const kind = ASSET_FOR_TYPE[type] ? type : 'coin';
  return (
    <div className={`${styles.v} ${styles[kind]} ${styles[state]} ${float ? styles.float : ''} ${reveal ? styles.reveal : ''} ${className}`} style={{ '--s': `${size}px` }} aria-hidden="true">
      <span className={styles.halo} />
      {kind === 'coin' && <span className={styles.rays} />}
      {kind === 'gift-card' && <span className={styles.ticket} />}
      {kind === 'crown' && <span className={styles.orbit} />}
      <Asset name={asset} className={styles.art} priority={priority} maxPx={Math.round(size * 1.2)} />
      {kind === 'gift-box' && (
        <>
          <i className={`${styles.sp} ${styles.sp1}`} />
          <i className={`${styles.sp} ${styles.sp2}`} />
          <i className={`${styles.sp} ${styles.sp3}`} />
        </>
      )}
      {reveal ? <Burst key={reveal} kind={kind} size={size} /> : null}
    </div>
  );
}
