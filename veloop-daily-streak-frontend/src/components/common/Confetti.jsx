import { useMemo } from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#ffd977', '#f5c451', '#a78bfa', '#8b5cf6', '#4ade80', '#fff3d6'];

// One restrained burst (~28 small pieces, 1.6s). Remount with a new `burstKey`
// to fire again. Purely decorative — aria-hidden and pointer-events: none.
export default function Confetti({ burstKey = 0, pieces = 28 }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
        const dist = 90 + Math.random() * 130;
        return {
          id: i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 40,
          rot: (Math.random() - 0.5) * 720,
          color: COLORS[i % COLORS.length],
          delay: Math.random() * 120,
          w: 5 + Math.random() * 5,
          h: 3 + Math.random() * 6,
          round: i % 3 === 0,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey, pieces]
  );

  return (
    <div className={styles.layer} aria-hidden="true" key={burstKey}>
      {items.map((p) => (
        <span
          key={p.id}
          className={styles.piece}
          style={{
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--rot': `${p.rot}deg`,
            background: p.color,
            width: p.w,
            height: p.round ? p.w : p.h,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
