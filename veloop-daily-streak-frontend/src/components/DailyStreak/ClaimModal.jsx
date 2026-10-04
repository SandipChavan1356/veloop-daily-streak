import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, Wallet } from 'lucide-react';
import { assetForType } from '../icons/RewardArt';
import Button from '../common/Button';
import { useCountUp } from '../../hooks/useCountUp';
import { useServerCountdown } from '../../hooks/useServerCountdown';
import { isMoney, rewardAmount } from '../../utils/format';
import styles from './ClaimModal.module.css';

// Reward reveal. Every number here came back from the backend after the claim
// (reward, new balance, next unlock time) — nothing is assumed client-side.
export default function ClaimModal({ result, onClose }) {
  const btn = useRef(null);
  const { day, reward, assetType, transactionId, before, after, streak, serverTime } = result;
  const amount = useCountUp(reward.amount, { duration: 900 });
  const money = isMoney(reward.currency);
  const cd = useServerCountdown(serverTime, streak?.eligibleNow ? null : streak?.nextClaimAt);
  const completed = streak?.status === 'COMPLETED';

  useEffect(() => {
    btn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`Day ${day} reward claimed`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card}>
        <div className={styles.halo} />
        <div className={styles.check}><Check size={18} strokeWidth={3.4} /></div>
        <div className={styles.art}>{assetForType(assetType, { size: 96 })}</div>
        <div className={styles.eyebrow}>Day {day} claimed</div>
        <div className={`${styles.amount} tabular`}>
          {money ? `₹${reward.amount}` : `+${amount}`}
          <span className={styles.unit}>{money ? 'gift card' : reward.currency}</span>
        </div>
        <div className={styles.note}>{money ? 'Credited to your gift-card balance — fulfilment is processed by the VELoop team.' : 'Added to your wallet.'}</div>

        {after != null && (
          <div className={styles.wallet}>
            <Wallet size={15} />
            <span className="tabular">{money ? '₹' : ''}{before ?? 0}</span>
            <span className={styles.arrow}>→</span>
            <b className="tabular">{money ? '₹' : ''}{after}</b>
            <span className={styles.walletLabel}>{money ? 'gift card balance' : 'VES balance'}</span>
          </div>
        )}

        <div className={styles.next}>
          {completed ? (
            <span>🎉 You completed the full streak!</span>
          ) : streak?.nextReward ? (
            <>
              <Lock size={13} /> Day {streak.currentDay} ({rewardAmount(streak.nextReward)}) unlocks in <b className="tabular">{cd.label}</b>
            </>
          ) : null}
        </div>

        <div className={styles.actions}>
          <Button ref={btn} onClick={onClose} full>Awesome</Button>
          <Link to="/rewards" className={styles.link} onClick={onClose}>View rewards</Link>
        </div>
        {transactionId && <div className={styles.txn}>Ref {transactionId}</div>}
      </div>
    </div>
  );
}
