import { useEffect, useRef } from 'react';
import styles from './ParticleField.module.css';

// Ambient background: slow-drifting gold / violet dust. Cheap on purpose —
// ~40 particles, DPR capped at 2, pauses when the tab is hidden, and renders a
// single static frame for users who prefer reduced motion.
export default function ParticleField({ density = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles = [];

    const palette = ['245,196,81', '167,139,250', '196,176,255', '255,233,168'];

    const make = () => {
      const count = Math.round(Math.min(46, (w * h) / 42000) * density);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.7 + 0.5,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(Math.random() * 0.22 + 0.05),
        tw: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.02 + 0.006,
        c: palette[(Math.random() * palette.length) | 0],
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      make();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.tw += p.ts;
        const a = 0.25 + Math.sin(p.tw) * 0.25 + 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
          if (p.x < -4) p.x = w + 4;
          if (p.x > w + 4) p.x = -4;
        }
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    draw();
    if (!reduce) raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density]);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
