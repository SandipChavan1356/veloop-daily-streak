import { Link } from 'react-router-dom';
import { FlameSvg } from '../icons/RewardArt';
import styles from './Logo.module.css';

export default function Logo({ to = '/dashboard', tagline = 'Daily Streak', compact = false }) {
  return (
    <Link to={to} className={styles.logo} aria-label="VELoop Rewards home">
      <span className={styles.mark}>
        <FlameSvg size={compact ? 20 : 24} />
      </span>
      {!compact && (
        <span className={styles.text}>
          <span className={styles.name}>VELoop</span>
          <span className={styles.tag}>{tagline}</span>
        </span>
      )}
    </Link>
  );
}
