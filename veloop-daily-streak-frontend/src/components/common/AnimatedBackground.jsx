import ParticleField from './ParticleField';
import styles from './AnimatedBackground.module.css';

// Layered atmosphere, all cheap: static gradients + grain (no repaint), two
// transform-only drifting lights, slowly rotating orbit lines, tiny stars and
// the existing small canvas dust. `focus` picks where the violet light sits:
// 'core' = behind the streak core, 'auth' = behind the login world.
export default function AnimatedBackground({ variant = 'app' }) {
  return (
    <div className={`${styles.bg} ${styles[variant]}`} aria-hidden="true">
      <span className={styles.base} />
      <span className={`${styles.light} ${styles.violet}`} />
      <span className={`${styles.light} ${styles.gold}`} />
      <span className={`${styles.light} ${styles.cyan}`} />
      <svg className={styles.orbits} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <g className={styles.spinA}><circle cx="500" cy="500" r="330" /><circle cx="500" cy="500" r="470" /></g>
        <g className={styles.spinB}><circle cx="500" cy="500" r="620" /><circle cx="500" cy="500" r="790" /></g>
      </svg>
      <span className={styles.stars} />
      <span className={styles.grain} />
      <span className={styles.vignette} />
      <ParticleField density={variant === 'auth' ? 1 : 0.6} />
    </div>
  );
}
