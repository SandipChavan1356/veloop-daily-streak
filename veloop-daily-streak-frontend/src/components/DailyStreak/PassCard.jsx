import { useEffect, useRef } from 'react';
import { Crown } from 'lucide-react';
import Asset from '../common/Asset';
import Odometer from './Odometer';
import { FlameSvg } from '../icons/RewardArt';
import { useInView } from '../../hooks/useInView';
import { pad2 } from '../../utils/streakState';
import styles from './PassCard.module.css';

const BURST = Array.from({ length: 9 }, (_, i) => ({ a: i * 40 + (i % 2 ? 8 : -6), d: 5.5 + (i % 3) * 1.6, t: (i % 3) * 40 }));
const canTilt = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

// A black-metal membership card. The 7 days are 7 engraved stamp slots:
// stamped (foil seal) · today (lit, with its reward) · sealed (engraved number).
// Pure presentation — states arrive from the caller (backend data in the app).
// Pointer tilt + holographic sheen (desktop), flip to a back face for the ledger.
export default function PassCard({ slots, holder = 'MEMBER', day, total, days, flipped = false, back = null, shakeKey = null, entrance = true }) {
  const wrap = useRef(null);
  const inView = useInView(wrap);
  const card = useRef(null);

  // impact shake when a claim lands — a class toggle, NOT a remount (seals/odometer must not replay)
  useEffect(() => {
    const el = card.current;
    if (!shakeKey || !el) return undefined;
    el.classList.remove(styles.impact);
    void el.offsetWidth;
    el.classList.add(styles.impact);
    const t = setTimeout(() => el.classList.remove(styles.impact), 800);
    return () => clearTimeout(t);
  }, [shakeKey]);

  const move = (e) => {
    const el = wrap.current;
    if (!el || !canTilt()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    el.dataset.live = '1';
  };
  const leave = () => {
    const el = wrap.current;
    if (!el) return;
    el.style.setProperty('--px', 0);
    el.style.setProperty('--py', 0);
    delete el.dataset.live;
  };

  return (
    <div ref={wrap} className={`${styles.wrap} ${entrance ? styles.enter : ''}`} data-paused={!inView} onPointerMove={move} onPointerLeave={leave}>
      <div className={styles.float}>
        <div className={styles.tilt}>
          <div ref={card} className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
            {/* ---------- front ---------- */}
            <div className={`${styles.face} ${styles.front}`} aria-hidden={flipped}>
              <span className={styles.brushed} />
              <div className={styles.top}>
                <span className={styles.brand}><FlameSvg size={22} /> VELoop</span>
                <span className={styles.type}>Streak Pass</span>
                <span className={styles.chip} />
              </div>

              <ol className={styles.slots} style={{ '--n': slots.length }}>
                {slots.map((s, i) => (
                  <li key={s.day} className={`${styles.slot} ${styles[s.state]} ${s.vip ? styles.vip : ''} ${s.fresh ? styles.slam : ''}`} style={{ '--i': i }} title={`Day ${s.day}`}>
                    {s.state === 'claimed' ? (
                      <>
                        <span className={styles.seal}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 12.5l4.2 4.2L18.5 8" pathLength="1" /></svg>
                        </span>
                        {s.fresh && (
                          <>
                            <span className={styles.ripple} />
                            {BURST.map((p, k) => (<i key={k} className={styles.dust} style={{ '--a': `${p.a}deg`, '--d': `${p.d}cqw`, '--t': `${p.t}ms` }} />))}
                          </>
                        )}
                      </>
                    ) : s.state === 'today' || s.state === 'waiting' ? (
                      <>
                        <span className={styles.led} />
                        {s.art && <Asset name={s.art} className={styles.slotArt} maxPx={72} eager />}
                      </>
                    ) : s.vip ? (
                      <Crown className={styles.crownIco} />
                    ) : (
                      <span className={styles.num}>{s.day}</span>
                    )}
                  </li>
                ))}
              </ol>

              <div className={styles.holder}>
                <span>Holder</span>
                <b>{holder}</b>
                <em className="tabular">Day {pad2(day)} <i>of</i> {pad2(total)}</em>
              </div>
              <div className={styles.streak}>
                <Odometer value={days} min={2} className={styles.big} />
                <span className={styles.cap}>day<br />streak</span>
              </div>
              <span className={styles.holo} />
              <span className={styles.spec} />
            </div>

            {/* ---------- back ---------- */}
            <div className={`${styles.face} ${styles.backFace}`} aria-hidden={!flipped}>
              <span className={styles.brushed} />
              <span className={styles.stripe} />
              <div className={styles.backBody}>{back}</div>
              <span className={styles.spec} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
