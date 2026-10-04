import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Crown, Lock } from 'lucide-react';
import RewardVisual from './RewardVisual';
import ClaimButton from './ClaimButton';
import { dayState, isVipCard, rewardUnit, pad2, claimStateFor } from '../../utils/streakState';
import { rewardAmount } from '../../utils/format';
import styles from './RewardIndex.module.css';

const TYPE = { coin: 'VES coins', 'gift-card': 'Gift card', 'gift-box': 'Bonus gift', crown: 'Vault reward' };
const STATUS = { claimed: 'Secured', today: 'Ready', waiting: 'On the clock', locked: 'Sealed' };
const hoverable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// An editorial index of the seven drops. Desktop: hover a row and its reward
// floats after your cursor. Everywhere (and for keyboard/touch): the row opens
// in place, so nothing important is hover-only. State comes from the backend.
export default function RewardIndex({ rewards, checkedIn, total, onClaim, claimingDay, celebrationDay, failDay }) {
  const list = useRef(null);
  const float = useRef(null);
  const pos = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0 });
  const [hover, setHover] = useState(null);

  const todayIdx = rewards.findIndex((r) => r.isToday && r.status !== 'CLAIMED');
  const [open, setOpen] = useState(todayIdx >= 0 ? todayIdx : 0);
  const frozen = celebrationDay != null;
  useEffect(() => {
    if (!frozen) setOpen(todayIdx >= 0 ? todayIdx : 0);
  }, [todayIdx, frozen]);

  // cursor follower: one element, moved with a transform, rAF only while a row is hovered
  useEffect(() => {
    if (hover == null) return undefined;
    const p = pos.current;
    const tick = () => {
      p.x += (p.tx - p.x) * 0.16;
      p.y += (p.ty - p.y) * 0.16;
      if (float.current) float.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      p.raf = requestAnimationFrame(tick);
    };
    p.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(p.raf);
  }, [hover]);

  const track = (e) => {
    const r = list.current.getBoundingClientRect();
    pos.current.tx = e.clientX - r.left + 28;
    pos.current.ty = e.clientY - r.top - 120;
    if (hover == null) {
      pos.current.x = pos.current.tx;
      pos.current.y = pos.current.ty;
    }
  };

  if (!rewards?.length) return null;
  const hovered = hover != null && hover !== open ? rewards[hover] : null;
  const cs = { claimingDay, celebrationDay, failDay };

  return (
    <section className={styles.section} aria-labelledby="index-title">
      <header className={styles.head}>
        <h2 id="index-title" className={styles.h}>Reward index</h2>
        <span className={`${styles.count} tabular`}><b>{pad2(checkedIn)}</b> / {pad2(total)} secured</span>
      </header>

      <div className={styles.listWrap} ref={list} onPointerMove={(e) => hoverable() && track(e)} onPointerLeave={() => setHover(null)}>
      <ol className={styles.list}>
        {rewards.map((card, i) => {
          const state = dayState(card);
          const vip = isVipCard(card);
          const isOpen = open === i;
          const fresh = celebrationDay === card.day;
          const st = fresh ? 'claimed' : state;
          const canClaim = state === 'today' || fresh || failDay === card.day;
          return (
            <li key={card.day} className={`${styles.row} ${styles[st]} ${vip ? styles.vip : ''} ${isOpen ? styles.open : ''}`} style={{ '--i': i }}>
              <button
                className={styles.btn}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                onPointerEnter={(e) => { if (hoverable()) { track(e); setHover(i); } }}
                onFocus={() => setHover(null)}
              >
                <span className={`${styles.num} tabular`}>{pad2(card.day)}</span>
                <span className={styles.main}>
                  <span className={styles.amtWrap}>
                    <span className={`${styles.amt} tabular`}>{rewardAmount(card.reward)}</span>
                    <span className={styles.unit}>{rewardUnit(card.reward)}</span>
                    <span className={styles.strike} />
                  </span>
                  <span className={styles.title}>{card.reward.subtitle || card.reward.title}</span>
                </span>
                <span className={styles.type}>{vip && <Crown size={14} />}{TYPE[card.reward.assetType] || 'Reward'}</span>
                <span className={styles.status}>
                  {st === 'claimed' ? <Check size={13} strokeWidth={3.4} /> : st === 'locked' ? <Lock size={12} /> : <i className={styles.dot} />}
                  {STATUS[st]}
                </span>
                <ChevronDown size={18} className={styles.chev} />
              </button>

              <div className={styles.panel}>
                <div className={styles.clip}>
                <div className={styles.panelIn}>
                  <RewardVisual type={card.reward.assetType} size={104} state={st === 'locked' ? 'sealed' : 'open'} float={false} />
                  <div className={styles.detail}>
                    <p>
                      {st === 'claimed' ? 'Stamped on your pass.' : st === 'today' ? 'Your drop is ready — claim it before the chain breaks.' : st === 'waiting' ? 'Unlocks when today’s timer ends.' : `Opens after Day ${pad2(card.day - 1)}.`}
                    </p>
                    {canClaim && <ClaimButton state={claimStateFor(card.day, cs)} onClick={() => onClaim(card.day)} size="md" />}
                  </div>
                </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

        {hovered && (
          <div className={styles.float} ref={float} aria-hidden="true">
            <div key={hover} className={styles.floatIn}>
              <RewardVisual type={hovered.reward.assetType} size={150} state={dayState(hovered) === 'locked' ? 'sealed' : 'open'} float={false} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
