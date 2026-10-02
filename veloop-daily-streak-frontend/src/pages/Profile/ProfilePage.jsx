import { User, Mail, CalendarDays, Gem, IndianRupee, Flame, Trophy, CalendarCheck, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStreakData } from '../../context/StreakDataContext';
import { useAsync } from '../../hooks/useAsync';
import * as insightsApi from '../../services/insightsApi';
import PageHeader from '../../components/common/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import { Avatar } from '../../components/layout/UserMenu';
import { formatDate } from '../../utils/format';
import p from '../Page.module.css';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const { ves, inr } = useStreakData();
  const { data, error, reload } = useAsync(insightsApi.getOverview);

  return (
    <div className={p.stack}>
      <PageHeader icon={User} title="Profile" />
      <div className={styles.card}>
        <Avatar name={user?.username} size={78} />
        <div className={styles.info}>
          <h2 className={styles.name}>{user?.username}</h2>
          <div className={styles.row}><Mail size={14} /> {user?.email}</div>
          <div className={styles.row}><CalendarDays size={14} /> {data ? `Member since ${formatDate(data.profile.memberSince)}` : <Skeleton w={160} h={14} r={6} />}</div>
        </div>
      </div>

      {error ? (
        <div className={p.card}><ErrorState message={error.message} onRetry={reload} /></div>
      ) : (
        <div className={p.grid4}>
          {[
            [Flame, 'Current streak', data?.streak.current, 'tGold'],
            [Trophy, 'Longest streak', data?.streak.longest, 'tViolet'],
            [CalendarCheck, 'Total check-ins', data?.streak.totalCheckIns, 'tGreen'],
            [Gift, 'Rewards earned', data ? data.rewards.giftCardCount + (data.rewards.vesEarned > 0 ? data.streak.totalCheckIns - data.rewards.giftCardCount : 0) : undefined, 'tViolet'],
          ].map(([Icon, label, val, tone]) => (
            <div key={label} className={p.tile}>
              <div className={`${p.tileIcon} ${p[tone]}`}><Icon size={20} /></div>
              <div className={p.tileLabel}>{label}</div>
              <div className={`${p.tileValue} tabular`}>{val ?? '—'}</div>
            </div>
          ))}
        </div>
      )}

      <div className={p.grid2}>
        <div className={`${styles.bal} ${styles.balVes}`}><Gem size={22} /><div><div className={styles.balLabel}>VES balance</div><div className={`${styles.balVal} tabular`}>{ves ?? '—'}</div></div></div>
        <div className={`${styles.bal} ${styles.balInr}`}><IndianRupee size={22} /><div><div className={styles.balLabel}>Amazon gift card value</div><div className={`${styles.balVal} tabular`}>₹{inr ?? 0}</div></div></div>
      </div>
    </div>
  );
}
