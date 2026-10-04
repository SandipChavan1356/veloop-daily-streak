import { useMemo } from 'react';
import ParticleField from './ParticleField';
import { motionTier } from '../../utils/device';
import styles from './AnimatedBackground.module.css';

// "Obsidian": black base → warm gold spotlight → banknote-style guilloche moiré →
// a slow light beam → gold dust. Transform/opacity only; tiered by device.
export default function AnimatedBackground({ variant = 'app' }) {
  const tier = useMemo(motionTier, []);
  return (
    <div className={`${styles.bg} ${styles[variant]} ${styles[tier]}`} aria-hidden="true">
      <span className={styles.base} />
      <span className={`${styles.glow} ${styles.g1}`} />
      <span className={`${styles.glow} ${styles.g2}`} />
      <span className={styles.guilloche} />
      <span className={styles.beam} />
      {tier === 'full' && (
        <>
          <i className={`${styles.sparkle} ${styles.s1}`} />
          <i className={`${styles.sparkle} ${styles.s2}`} />
          <i className={`${styles.sparkle} ${styles.s3}`} />
          <i className={`${styles.sparkle} ${styles.s4}`} />
        </>
      )}
      <span className={styles.grain} />
      <span className={styles.vignette} />
      {tier !== 'off' && <ParticleField density={tier === 'lite' ? 0.3 : 0.55} fps={tier === 'lite' ? 30 : 60} />}
    </div>
  );
}
