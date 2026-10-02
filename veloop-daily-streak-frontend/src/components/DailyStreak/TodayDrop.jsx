import { Crown, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import RewardVisual from './RewardVisual';
import { useServerCountdown } from '../../hooks/useServerCountdown';
import { rewardAmount, rewardLabel } from '../../utils/format';
import { rewardUnit, pad2 } from '../../utils/streakState';
import styles from './TodayDrop.module.css';

function Countdown({ serverTime, target, onComplete }) {
  const cd = useServerCountdown(serverTime, target, { onComplete });
  const [hh, mm, ss] = cd.label.split(':');
  return (
    <div className={styles.timer} role="timer" aria-label={`Arrives in ${cd.label}`}>
      <span className={styles.tLabel}>Arrives in</span>
      <span className={`${styles.tDigits} tabular`}>
        <b>{hh}</b><i>:</i><b>{mm}</b><i>:</i><b>{ss}</b>
      </span>
    </div>
  );
}

// Right-hand side of the stage: the reward object itself, free-floating (no card),
// and the one action. Every state is read from the backend payload.
export default function TodayDrop({ streak, rewards, serverTime, onClaim, claiming, completed, onTimerComplete }) {
  const claimable = rewards.find((r) => r.isToday && r.status === 'AVAILABLE');
  const waiting = rewards.find((r) => r.isToday && r.status === 'LOCKED');
  const card = claimable || waiting;
  const target = waiting?.nextClaimAt || (!streak.eligibleNow ? streak.nextClaimAt : null);
  const after = card ? rewards.find((r) => r.day === card.day + 1) : null;

  if (!card) {
    const last = rewards[rewards.length - 1];
    return (
      <div className={styles.drop}>
        <div className={styles.kicker}>{completed ? 'Vault open' : 'All caught up'}</div>
        {completed && last && <RewardVisual type={last.reward.assetType} size={170} />}
        <h2 className={styles.title}>{completed ? 'Every drop is yours.' : 'Nothing left today.'}</h2>
        <p className={styles.note}>{completed ? `All ${streak.totalRewards} rewards claimed.` : 'Come back tomorrow to keep the chain alive.'}</p>
      </div>
    );
  }

  const r = card.reward;
  return (
    <div className={styles.drop}>
      <div className={styles.kicker}>
        <span>{claimable ? "Today's drop" : 'Next drop'}</span>
        <i className="tabular">Day {pad2(card.day)}</i>
      </div>

      <div className={styles.visual}>
        <RewardVisual type={r.assetType} size={claimable ? 190 : 170} state={claimable ? 'open' : 'sealed'} />
      </div>

      <div className={styles.worth}>
        <span className={`${styles.amount} tabular`}>{rewardAmount(r)}</span>
        <span className={styles.unit}>{rewardUnit(r)}</span>
      </div>
      <div className={styles.what}>{r.subtitle || r.title}</div>

      {claimable ? (
        <button className={styles.claim} onClick={() => onClaim(card.day)} disabled={claiming}>
          {claiming ? (<><RotateCcw size={18} className={styles.spin} /> Securing…</>) : (<><Sparkles size={18} /> Claim drop</>)}
        </button>
      ) : target ? (
        <Countdown serverTime={serverTime} target={target} onComplete={onTimerComplete} />
      ) : null}

      {after && (
        <div className={styles.after}>
          <span>Then</span>
          <b className="tabular">Day {pad2(after.day)}</b>
          <ArrowRight size={13} />
          <span className={styles.afterAmt}>{rewardLabel(after.reward)}</span>
          {after.reward.assetType === 'crown' && <Crown size={13} />}
        </div>
      )}
    </div>
  );
}
