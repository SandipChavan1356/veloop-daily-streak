import { Check, Lock, Sparkles, RotateCcw } from 'lucide-react';
import Asset from '../common/Asset';
import { ASSET_FOR_TYPE } from '../../assets/veloop';
import { rewardAmount } from '../../utils/format';
import { rewardUnit, pad2 } from '../../utils/streakState';
import styles from './JourneyNode.module.css';

export const STATE_TEXT = {
  claimed: 'Secured',
  today: 'Ready — claim it now',
  waiting: 'Arrives when the timer ends',
  locked: (day) => `Opens after Day ${pad2(day - 1)}`,
};
export const stateText = (state, day) => (typeof STATE_TEXT[state] === 'function' ? STATE_TEXT[state](day) : STATE_TEXT[state]);

// One destination on the trail: a disc with the reward object floating over it
// and a short label. State comes from the backend via the parent.
export default function JourneyNode({ card, state, vip, selected, onSelect, x, y, side, index, layout, onClaim, claiming, claimDisabled }) {
  const { day, reward } = card;
  const asset = ASSET_FOR_TYPE[reward.assetType] || 'coin';

  return (
    <div
      className={`${styles.node} ${styles[state]} ${vip ? styles.vip : ''} ${selected ? styles.sel : ''} ${styles[side]} ${styles[layout]}`}
      style={{ left: `${x}%`, top: `${y}%`, '--i': index }}
    >
      <button
        type="button"
        className={styles.disc}
        onMouseEnter={onSelect}
        onFocus={onSelect}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Day ${day}: ${rewardAmount(reward)} ${rewardUnit(reward)}. ${stateText(state, day)}.`}
      >
        <span className={styles.halo} />
        <span className={styles.ring} />
        <Asset name={asset} className={styles.art} eager />
        {state === 'claimed' && <span className={styles.badge}><Check size={13} strokeWidth={3.6} /></span>}
        {state === 'locked' && <span className={`${styles.badge} ${styles.lockBadge}`}><Lock size={11} /></span>}
      </button>

      <div className={styles.label}>
        <span className={`${styles.day} tabular`}>Day {pad2(day)}{state === 'today' || state === 'waiting' ? <em>Today</em> : null}</span>
        <span className={`${styles.amt} tabular`}>
          {rewardAmount(reward)} <i>{rewardUnit(reward)}</i>
        </span>
        {layout === 'vertical' && selected && (
          <div className={styles.more}>
            <span className={styles.status}>{stateText(state, day)}</span>
            {reward.subtitle && <span className={styles.sub}>{reward.subtitle}</span>}
            {state === 'today' && (
              <button className={styles.claim} onClick={() => onClaim(day)} disabled={claimDisabled}>
                {claiming ? (<><RotateCcw size={14} className={styles.spin} /> Securing…</>) : (<><Sparkles size={14} /> Claim drop</>)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
