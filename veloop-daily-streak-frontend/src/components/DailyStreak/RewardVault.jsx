import Asset from '../common/Asset';
import RewardVisual from './RewardVisual';
import { ASSET_FOR_TYPE } from '../../assets/veloop';
import { earnedTotals, pad2 } from '../../utils/streakState';
import { rewardAmount, rewardLabel } from '../../utils/format';
import styles from './RewardVault.module.css';

// The ledger: what's secured, what's next, what's still sealed. Three parts of
// deliberately different weight — a hierarchy, not three equal stat cards.
export default function RewardVault({ rewards, streak }) {
  const earned = earnedTotals(rewards);
  const total = rewards.length;
  const next = rewards.find((r) => r.isToday && r.status !== 'CLAIMED') || rewards.find((r) => r.status !== 'CLAIMED');
  const sealed = rewards.filter((r) => r.status !== 'CLAIMED' && r !== next);

  return (
    <section className={styles.vault} aria-labelledby="vault-title">
      <header className={styles.head}>
        <h2 id="vault-title" className={styles.h}>Reward vault</h2>
        <span className={`${styles.meta} tabular`}>{pad2(earned.count)} / {pad2(total)} secured</span>
      </header>

      <div className={styles.ledger}>
        <div className={styles.earned}>
          <div className={styles.label}>Secured</div>
          <div className={`${styles.big} tabular`}>
            {earned.ves > 0 ? `+${earned.ves}` : earned.inr > 0 ? `₹${earned.inr}` : '0'}
            <i>{earned.ves > 0 ? 'VES' : earned.inr > 0 ? 'in gift cards' : 'nothing yet'}</i>
          </div>
          {earned.ves > 0 && earned.inr > 0 && <div className={`${styles.sub} tabular`}>+ ₹{earned.inr} in gift cards</div>}
          <div className={styles.bar} aria-hidden="true">
            {rewards.map((r) => (
              <span key={r.day} className={r.status === 'CLAIMED' ? styles.on : ''} />
            ))}
          </div>
          <Asset name="coin" className={styles.coin} />
        </div>

        <div className={styles.next}>
          <div className={styles.label}>Next unlock</div>
          {next ? (
            <div className={styles.nextRow}>
              <RewardVisual type={next.reward.assetType} size={78} state={next.isToday ? 'open' : 'sealed'} float={false} />
              <div>
                <div className={`${styles.nDay} tabular`}>Day {pad2(next.day)}</div>
                <div className={`${styles.nAmt} tabular`}>{rewardAmount(next.reward)}</div>
                <div className={styles.nSub}>{next.reward.subtitle || rewardLabel(next.reward)}</div>
              </div>
            </div>
          ) : (
            <div className={styles.nSub}>Nothing left to unlock.</div>
          )}
        </div>

        <div className={styles.sealed}>
          <div className={styles.label}>Sealed</div>
          <div className={`${styles.count} tabular`}>{pad2(sealed.length)}</div>
          <div className={styles.stack} aria-hidden="true">
            {sealed.slice(0, 4).map((r, i) => (
              <Asset key={r.day} name={ASSET_FOR_TYPE[r.reward.assetType] || 'coin'} className={styles.mini} eager style={{ '--k': i }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
