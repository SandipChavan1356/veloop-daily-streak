import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import JourneyNode, { stateText } from './JourneyNode';
import RewardVisual from './RewardVisual';
import { dayState, isVipCard, rewardUnit, pad2 } from '../../utils/streakState';
import { rewardAmount } from '../../utils/format';
import styles from './StreakJourney.module.css';

// ---------- geometry (in a fixed viewBox, positioned by % so it scales) ----------
function layoutPoints(n, layout) {
  if (layout === 'vertical') {
    const row = 128;
    const W = 360;
    const H = n * row + 70;
    const pts = Array.from({ length: n }, (_, i) => {
      const last = i === n - 1;
      return { x: last ? 180 : i % 2 ? 268 : 92, y: 60 + i * row + (last ? 30 : 0), side: last ? 'below' : i % 2 ? 'left' : 'right' };
    });
    return { W, H, pts };
  }
  const W = 1200;
  const H = 410;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const last = i === n - 1;
    return { x: 84 + t * 1032, y: last ? 92 : 288 - 150 * t + (i % 2 ? -42 : 22), side: 'below' };
  });
  return { W, H, pts };
}

const seg = (a, b, layout) => {
  if (layout === 'vertical') {
    const m = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${m}, ${b.x} ${m}, ${b.x} ${b.y}`;
  }
  const m = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${m} ${a.y}, ${m} ${b.y}, ${b.x} ${b.y}`;
};

function useWidth(ref) {
  const [w, setW] = useState(1000);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

// The 7-day path. Claimed segments are lit, the one into today breathes with
// energy, the rest fade into the distance. Hover / focus / tap a node to inspect it.
export default function StreakJourney({ rewards, checkedIn, total, onClaim, claimingDay }) {
  const uid = useId().replace(/:/g, '');
  const host = useRef(null);
  const width = useWidth(host);
  const layout = width < 720 ? 'vertical' : 'horizontal';
  const n = rewards.length;

  const { W, H, pts } = useMemo(() => layoutPoints(n, layout), [n, layout]);

  // default focus = today's day, else the last claimed, else the first
  const defaultIdx = useMemo(() => {
    const t = rewards.findIndex((r) => r.isToday && r.status !== 'CLAIMED');
    if (t >= 0) return t;
    const claimed = rewards.map((r) => r.status === 'CLAIMED').lastIndexOf(true);
    return Math.max(0, claimed);
  }, [rewards]);
  const [sel, setSel] = useState(defaultIdx);
  useEffect(() => setSel(defaultIdx), [defaultIdx]);

  if (!n) return null;
  const states = rewards.map(dayState);
  const cur = rewards[sel] ?? rewards[0];
  const curState = states[sel] ?? states[0];

  return (
    <section className={styles.section} aria-labelledby="trail-title">
      <header className={styles.head}>
        <h2 id="trail-title" className={styles.h}>The trail</h2>
        <p className={styles.p}>
          <b className="tabular">{pad2(checkedIn)}</b> of <span className="tabular">{pad2(total)}</span> secured
        </p>
      </header>

      <div className={styles.hostWrap} ref={host}>
        <div className={`${styles.box} ${styles[layout]}`} style={{ aspectRatio: `${W} / ${H}` }}>
          <svg className={styles.paths} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              {pts.slice(0, -1).map((p, i) => (
                <linearGradient key={i} id={`${uid}-g${i}`} gradientUnits="userSpaceOnUse" x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y}>
                  <stop offset="0" stopColor="#38d5ff" />
                  <stop offset="1" stopColor="#ffd977" />
                </linearGradient>
              ))}
            </defs>
            {pts.slice(0, -1).map((p, i) => {
              const d = seg(p, pts[i + 1], layout);
              const lit = states[i] === 'claimed';
              return lit ? (
                <g key={i} style={{ '--i': i }}>
                  <path d={d} pathLength="1" className={styles.lit} stroke={`url(#${uid}-g${i})`} />
                  <path d={d} pathLength="1" className={styles.energy} />
                </g>
              ) : (
                <path key={i} d={d} className={styles.far} />
              );
            })}
          </svg>

          {rewards.map((card, i) => (
            <JourneyNode
              key={card.day}
              card={card}
              state={states[i]}
              vip={isVipCard(card)}
              selected={sel === i}
              onSelect={() => setSel(i)}
              x={(pts[i].x / W) * 100}
              y={(pts[i].y / H) * 100}
              side={pts[i].side}
              index={i}
              layout={layout}
              onClaim={onClaim}
              claiming={claimingDay === card.day}
              claimDisabled={claimingDay != null}
            />
          ))}
        </div>
      </div>

      {layout === 'horizontal' && (
        <div className={styles.inspector} aria-live="polite">
          <RewardVisual type={cur.reward.assetType} size={92} state={curState === 'locked' ? 'sealed' : 'open'} />
          <div className={styles.iText}>
            <div className={`${styles.iKicker} tabular`}>Day {pad2(cur.day)} · {stateText(curState, cur.day)}</div>
            <div className={styles.iTitle}>
              <span className="tabular">{rewardAmount(cur.reward)}</span> <i>{rewardUnit(cur.reward)}</i>
            </div>
            <div className={styles.iSub}>{cur.reward.subtitle || cur.reward.title}</div>
          </div>
          {curState === 'today' && (
            <button className={styles.iClaim} onClick={() => onClaim(cur.day)} disabled={claimingDay != null}>
              {claimingDay === cur.day ? (<><RotateCcw size={16} className={styles.spin} /> Securing…</>) : (<><Sparkles size={16} /> Claim drop</>)}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
