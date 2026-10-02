import { useId } from 'react';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import Asset from '../../components/common/Asset';
import Logo from '../../components/common/Logo';
import styles from './Auth.module.css';

const N = 7;
const GAP = 2.4;
const SEG = 100 / N - GAP;
// a representative run: three secured, one live, three ahead
const DEMO = ['claimed', 'claimed', 'claimed', 'today', 'locked', 'locked', 'locked'];

// A living preview of the product's core object: the 7-segment ring, the flame,
// and the reward objects circling it.
function World() {
  const gid = useId().replace(/:/g, '');
  return (
    <div className={styles.world} aria-hidden="true">
      <span className={styles.aura} />
      <span className={styles.orbit}><i /></span>
      <svg className={styles.ring} viewBox="0 0 400 400">
        <defs>
          <linearGradient id={`${gid}-g`} gradientUnits="userSpaceOnUse" x1="40" y1="360" x2="360" y2="40">
            <stop offset="0" stopColor="#38d5ff" />
            <stop offset="1" stopColor="#ffd977" />
          </linearGradient>
        </defs>
        {DEMO.map((st, i) => (
          <circle
            key={i}
            className={`${styles.seg} ${styles[st]}`}
            cx="200" cy="200" r="150" pathLength="100"
            strokeDasharray={`${SEG} ${100 - SEG}`}
            transform={`rotate(${-90 + (i * 360) / N + GAP * 1.8} 200 200)`}
            style={{ '--i': i, ...(st === 'claimed' ? { stroke: `url(#${gid}-g)` } : null) }}
          />
        ))}
      </svg>
      <div className={styles.disc}>
        <Asset name="flame" className={styles.flame} eager />
        <div className={styles.num}>3</div>
        <div className={styles.cap}>days in</div>
      </div>
      <Asset name="heroCrown" className={styles.crown} eager />
      <Asset name="coin" className={styles.coin} eager />
      <Asset name="exclusive" className={styles.gift} eager />
      <Asset name="stayActive" className={styles.cal} eager />
    </div>
  );
}

// Editorial split: the VELoop world on the left, a flat sign-in column on the right.
// On phones the world becomes a compact header and the form a bottom sheet.
export default function AuthLayout({ children }) {
  return (
    <div className={styles.page}>
      <AnimatedBackground variant="auth" />

      <section className={styles.stage} aria-label="VELoop Rewards">
        <div className={styles.brand}><Logo to="/login" /></div>
        <World />
        <div className={styles.statement}>
          <h2 className={styles.headline}>
            <span>Keep the chain</span>
            <span>alive.</span>
          </h2>
          <p className={styles.lede}>Seven days. Bigger drops. One final vault.</p>
          <ol className={styles.ticker} aria-hidden="true">
            {Array.from({ length: N }).map((_, i) => (<li key={i} className={i < 3 ? styles.tOn : i === 3 ? styles.tNow : ''} />))}
          </ol>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.sheet}>{children}</div>
      </section>
    </div>
  );
}
