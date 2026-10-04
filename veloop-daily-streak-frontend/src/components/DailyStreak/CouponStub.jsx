import { Crown, ArrowRight, Check } from 'lucide-react';
import RewardVisual from './RewardVisual';
import ClaimButton from './ClaimButton';
import Odometer from './Odometer';
import { useServerCountdown } from '../../hooks/useServerCountdown';
import { rewardAmount, rewardLabel, isMoney } from '../../utils/format';
import { rewardUnit, pad2, claimStateFor } from '../../utils/streakState';
import styles from './CouponStub.module.css';

function Countdown({ serverTime, target, onComplete }) {
  const cd = useServerCountdown(serverTime, target, { onComplete });
  return (
    <div className={styles.timer} role="timer" aria-label={`Arrives in ${cd.label}`}>
      <span className={styles.tLabel}>Arrives in</span>
      <Odometer text={cd.label} ms={520} className={styles.tDigits} />
    </div>
  );
}

// Today's coupon: a perforated ticket. Body = the reward, stub = the action.
// On a backend-confirmed claim the stub is torn off along the perforation and a
// CLAIMED stamp lands on the body (amount shown comes from the API response).
export default function CouponStub({ streak, rewards, serverTime, onClaim, claimingDay, celebration, failDay, completed, onTimerComplete }) {
  const claimable = rewards.find((r) => r.isToday && r.status === 'AVAILABLE');
  const waiting = rewards.find((r) => r.isToday && r.status === 'LOCKED');
  const cel = celebration;
  const card = cel ? cel.card : claimable || waiting;
  const target = waiting?.nextClaimAt || (!streak.eligibleNow ? streak.nextClaimAt : null);
  const after = card ? rewards.find((r) => r.day === card.day + 1) : null;

  if (!card) {
    const last = rewards[rewards.length - 1];
    return (
      <div className={`${styles.coupon} ${styles.plain}`}>
        <div key="done" className={styles.swap}>
          <div className={styles.kicker}><span>{completed ? 'Vault open' : 'All caught up'}</span></div>
          {completed && last && <div className={styles.visual}><RewardVisual type={last.reward.assetType} size={150} /></div>}
          <h2 className={styles.title}>{completed ? 'Every drop is yours.' : 'Nothing left today.'}</h2>
          <p className={styles.note}>{completed ? `All ${streak.totalRewards} rewards claimed.` : 'Come back tomorrow to keep the chain alive.'}</p>
        </div>
      </div>
    );
  }

  const r = cel ? { ...cel.card.reward, ...cel.reward } : card.reward; // amount/currency from the API response
  const btnState = claimStateFor(card.day, { claimingDay, celebrationDay: cel?.day, failDay });
  const mode = cel ? `cel-${cel.key}` : `${card.day}-${claimable ? 'open' : 'wait'}`;
  const live = Boolean(claimable || cel);

  return (
    <div className={styles.coupon}>
      <div key={mode} className={`${styles.swap} ${cel?.leaving ? styles.leaving : ''}`}>
        <div className={`${styles.body} ${cel ? styles.claimed : ''}`}>
          <div className={styles.kicker}>
            <span>{live ? "Today's coupon" : 'Next coupon'}</span>
            <i className="tabular">Nº {pad2(card.day)}</i>
          </div>
          <div className={styles.visual}>
            <RewardVisual type={r.assetType} size={live ? 168 : 150} state={live ? 'open' : 'sealed'} reveal={cel ? cel.key : null} priority />
          </div>
          <div className={styles.worth}>
            <span className={`${styles.amount} tabular`}>{rewardAmount(r)}</span>
            <span className={styles.unit}>{rewardUnit(r)}</span>
          </div>
          <div className={styles.what}>{r.subtitle || r.title}</div>
          {cel && (
            <div className={styles.stamp} aria-hidden="true">
              <span>Claimed</span>
              <small>{isMoney(r.currency) ? 'credited' : 'in wallet'}</small>
            </div>
          )}
        </div>

        <div className={styles.perf} aria-hidden="true" />

        <div className={`${styles.stub} ${cel ? styles.tear : ''}`}>
          {live ? (
            <ClaimButton state={btnState} onClick={() => onClaim(card.day)} size="lg" className={styles.claim} />
          ) : target ? (
            <Countdown serverTime={serverTime} target={target} onComplete={onTimerComplete} />
          ) : null}
          {!cel && after && (
            <div className={styles.after}>
              <span>Then</span><b className="tabular">Day {pad2(after.day)}</b><ArrowRight size={13} />
              <span>{rewardLabel(after.reward)}</span>
              {after.reward.assetType === 'crown' && <Crown size={13} />}
            </div>
          )}
          {cel && <div className={styles.secured}><Check size={14} strokeWidth={3.4} /> Reward secured</div>}
        </div>
      </div>
    </div>
  );
}
