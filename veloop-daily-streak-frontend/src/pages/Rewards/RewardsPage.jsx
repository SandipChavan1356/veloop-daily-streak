import { useCallback } from 'react';
import { Gift, Gem, IndianRupee, Wallet, Check, Lock, Receipt } from 'lucide-react';
import { useStreakData } from '../../context/StreakDataContext';
import { useAsync } from '../../hooks/useAsync';
import * as streakApi from '../../services/streakApi';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import { assetForType } from '../../components/icons/RewardArt';
import { rewardAmount, formatDateTime } from '../../utils/format';
import p from '../Page.module.css';
import styles from './Rewards.module.css';

export default function RewardsPage() {
  const { rewards, ves, inr, loading } = useStreakData();
  const fetchTx = useCallback(() => streakApi.getWalletTransactions(1, 15), []);
  const { data: tx, error, reload, loading: txLoading } = useAsync(fetchTx);

  return (
    <div className={p.stack}>
      <PageHeader icon={Gift} title="Rewards" subtitle="Your wallet and the full 7-day reward ladder." actions={<Button to="/daily-streak" size="sm">Open streak</Button>} />

      <div className={p.grid2}>
        <div className={`${styles.wallet} ${styles.ves}`}>
          <div className={styles.wIcon}><Gem size={22} /></div>
          <div>
            <div className={styles.wLabel}>VES balance</div>
            <div className={`${styles.wValue} tabular`}>{ves ?? '—'}</div>
            <div className={styles.wSub}>Spendable in the VELoop marketplace</div>
          </div>
        </div>
        <div className={`${styles.wallet} ${styles.inr}`}>
          <div className={styles.wIcon}><IndianRupee size={22} /></div>
          <div>
            <div className={styles.wLabel}>Amazon gift card value</div>
            <div className={`${styles.wValue} tabular`}>₹{inr ?? 0}</div>
            <div className={styles.wSub}>Gift cards are fulfilled by the VELoop team</div>
          </div>
        </div>
      </div>

      <div className={p.card}>
        <div className={p.cardHead}><div className={p.cardTitle}><Gift size={18} /> The 7-day ladder</div></div>
        {loading ? (
          <div className={styles.ladder}>{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} h={150} r={18} />)}</div>
        ) : (
          <div className={styles.ladder}>
            {rewards.map((c) => (
              <div key={c.day} className={`${styles.step} ${c.status === 'CLAIMED' ? styles.claimed : c.isToday ? styles.today : ''}`}>
                <div className={styles.stepDay}>Day {c.day}</div>
                <div className={styles.stepArt}>{assetForType(c.reward.assetType, { size: 44 })}</div>
                <div className={`${styles.stepAmt} tabular`}>{rewardAmount(c.reward)}</div>
                <div className={styles.stepSub}>{c.reward.subtitle}</div>
                <div className={styles.stepState}>
                  {c.status === 'CLAIMED' ? <><Check size={12} strokeWidth={3} /> Claimed</> : c.isToday && c.status === 'AVAILABLE' ? 'Claim now' : <><Lock size={11} /> {c.isToday ? 'Up next' : 'Locked'}</>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={p.card}>
        <div className={p.cardHead}><div className={p.cardTitle}><Receipt size={18} /> Wallet transactions</div>{tx && <span className={p.muted}>{tx.total} total</span>}</div>
        {txLoading && !tx ? (
          <Skeleton h={160} r={16} />
        ) : error ? (
          <ErrorState title="Couldn't load transactions" message={error.message} onRetry={reload} />
        ) : tx.transactions.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions yet" text="Claim your first reward and it will be recorded here." />
        ) : (
          <ul className={p.list}>
            {tx.transactions.map((t) => (
              <li key={t.transactionId} className={p.item}>
                <span className={`${p.itemIcon} ${t.currency === 'INR' ? p.tGold : p.tViolet}`}>{t.currency === 'INR' ? <Gift size={18} /> : <Gem size={18} />}</span>
                <div className={p.itemMain}>
                  <div className={p.itemTitle}>
                    Daily streak · Day {t.streakDay}
                    {t.fulfilmentStatus === 'PENDING' && <span className={`${p.chip} ${p.chipPending}`}>Pending payout</span>}
                    {t.fulfilmentStatus === 'FULFILLED' && <span className={`${p.chip} ${p.chipDone}`}>Fulfilled</span>}
                  </div>
                  <div className={p.itemSub}>{formatDateTime(t.createdAt)} · {t.transactionId}</div>
                </div>
                <div className={`${p.itemAmt} ${t.currency === 'INR' ? p.inr : p.plus}`}>{t.currency === 'INR' ? `₹${t.amount}` : `+${t.amount}`}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
