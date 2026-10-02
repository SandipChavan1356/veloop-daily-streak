import Asset from '../common/Asset';
import { ASSET_FOR_TYPE } from '../../assets/veloop';
import styles from './RewardVisual.module.css';

// Each reward TYPE gets its own staging, so the system feels alive:
//   coin → rays, gift-card → perforated ticket, gift-box → sparkles, crown → orbit.
// `state`: 'open' (full colour) | 'sealed' (silhouetted) | 'secured'.
export default function RewardVisual({ type = 'coin', size = 140, state = 'open', float = true, className = '' }) {
  const asset = ASSET_FOR_TYPE[type] || 'coin';
  const kind = ASSET_FOR_TYPE[type] ? type : 'coin';
  return (
    <div className={`${styles.v} ${styles[kind]} ${styles[state]} ${float ? styles.float : ''} ${className}`} style={{ '--s': `${size}px` }} aria-hidden="true">
      <span className={styles.halo} />
      {kind === 'coin' && <span className={styles.rays} />}
      {kind === 'gift-card' && <span className={styles.ticket} />}
      {kind === 'crown' && <span className={styles.orbit} />}
      <Asset name={asset} className={styles.art} />
      {kind === 'gift-box' && (
        <>
          <i className={`${styles.sp} ${styles.sp1}`} />
          <i className={`${styles.sp} ${styles.sp2}`} />
          <i className={`${styles.sp} ${styles.sp3}`} />
        </>
      )}
    </div>
  );
}
