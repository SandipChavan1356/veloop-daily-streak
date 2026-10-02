import { FlameSvg } from '../icons/RewardArt';
import styles from './AppFooter.module.css';

export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <FlameSvg size={16} /> VELoop — Daily Streak
      </div>
      <div className={styles.line}>Build your streak. Earn your rewards.</div>
      <div className={styles.copy}>© {new Date().getFullYear()} VELoop</div>
    </footer>
  );
}
