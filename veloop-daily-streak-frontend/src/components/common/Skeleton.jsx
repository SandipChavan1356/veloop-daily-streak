import styles from './Skeleton.module.css';

// Themed shimmer block. Uses the dark-violet surface, never a flat grey rectangle.
export default function Skeleton({ w = '100%', h = 16, r = 12, className = '', style }) {
  return <div className={`${styles.block} ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />;
}
