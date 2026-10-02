import { useCallback, useState } from 'react';
import { Activity, Flame, Gift } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as insightsApi from '../../services/insightsApi';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import { formatDateTime, rewardLabel } from '../../utils/format';
import p from '../Page.module.css';

const PAGE = 15;

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const fetchPage = useCallback(() => insightsApi.getActivity(page, PAGE), [page]);
  const { data, error, reload, loading } = useAsync(fetchPage);
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1;

  return (
    <div className={p.stack}>
      <PageHeader icon={Activity} title="Activity" subtitle="Your latest check-ins and rewards, straight from your wallet history." />
      <div className={p.card}>
        {error ? (
          <ErrorState title="Couldn't load activity" message={error.message} onRetry={reload} />
        ) : !data ? (
          <Skeleton h={260} r={16} />
        ) : data.activity.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" text="Your first check-in will show up here." action={<Button to="/daily-streak" size="sm">Start your streak</Button>} />
        ) : (
          <>
            <ul className={p.list} style={{ opacity: loading ? 0.6 : 1 }}>
              {data.activity.map((a) => (
                <li key={a.transactionId} className={p.item}>
                  <span className={`${p.itemIcon} ${a.currency === 'INR' ? p.tGold : p.tViolet}`}>{a.currency === 'INR' ? <Gift size={18} /> : <Flame size={18} />}</span>
                  <div className={p.itemMain}>
                    <div className={p.itemTitle}>Day {a.day} check-in
                      {a.fulfilmentStatus === 'PENDING' && <span className={`${p.chip} ${p.chipPending}`}>Pending payout</span>}
                    </div>
                    <div className={p.itemSub}>{formatDateTime(a.at)} · balance {a.currency === 'INR' ? '₹' : ''}{a.balanceAfter}</div>
                  </div>
                  <div className={`${p.itemAmt} ${a.currency === 'INR' ? p.inr : p.plus}`}>{rewardLabel(a)}</div>
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <div className={p.more} style={{ gap: 10 }}>
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</Button>
                <span className={p.muted} style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
                <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
