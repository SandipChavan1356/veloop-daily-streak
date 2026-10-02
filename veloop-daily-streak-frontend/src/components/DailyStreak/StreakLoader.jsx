import { CoinStack } from '../icons/RewardArt';
import { FlameSvg } from '../icons/RewardArt';
import styles from './StreakLoader.module.css';

// VELoop-branded first-load state. Renders INSIDE the app shell (the shell's
// sidebar and top bar stay on screen) instead of taking over the whole page.
export default function StreakLoader() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.center}>
        <div className={styles.orb}>
          <span className={styles.ring} />
          <span className={styles.ring2} />
          <CoinStack size={84} float={false} />
        </div>
        <div className={styles.brand}>
          <FlameSvg size={22} /> <span>VELoop</span>
        </div>
        <div className={styles.text}>Loading your streak…</div>
      </div>
    </div>
  );
}
