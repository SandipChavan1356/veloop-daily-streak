import { Flame, Trophy, CalendarCheck, Gift, Activity, TrendingUp, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStreakData } from '../../context/StreakDataContext';
import { useAsync } from '../../hooks/useAsync';
import { useCountUp } from '../../hooks/useCountUp';
import { useServerCountdown } from '../../hooks/useServerCountdown';
import * as insightsApi from '../../services/insightsApi';
import ProgressRing from '../../components/common/ProgressRing';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { Avatar } from '../../components/layout/UserMenu';
import { rewardLabel, timeAgo, formatDate } from '../../utils/format';
import p from '../Page.module.css';
import styles from './Dashboard.module.css';

function Tile({ icon: Icon, tone, label, value, sub }) {
  const v = useCountUp(value);
  return (
    <div className={p.tile}>
      <div className={`${p.tileIcon} ${p[tone]}`}><Icon size={20} /></div>
      <div className={p.tileLabel}>{label}</div>
      <div className={`${p.tileValue} tabular`}>{v}</div>
      <div className={p.tileSub}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { streak, serverTime, loading, error, retry } = useStreakData();
  const { data: ov, error: ovErr, reload } = useAsync(insightsApi.getOverview);
  const countdown = useServerCountdown(serverTime, streak?.eligibleNow ? null : streak?.nextClaimAt);

  if (error && !streak) return <ErrorState message={error.message} onRetry={retry} />;
  if (loading || !streak) {
    return (
      <div className={p.stack}>
        <Skeleton h={60} w="55%" />
        <Skeleton h={230} r={28} />
        <div className={p.grid4}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={150} r={22} />)}</div>
      </div>
    );
  }

  const total = streak.totalRewards;
  const ready = streak.eligibleNow;
  const max = Math.max(1, ...(ov?.week ?? []).map((d) => d.vesEarned));

  return (
    <div className={`${p.stack} vl-rise`}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.hi}>Welcome back, <span>{user?.username}</span> 👋</h1>
          <p className={styles.sub}>{ready ? 'Your reward is waiting — keep the streak alive.' : 'Nice work. Your next reward is on its way.'}</p>
        </div>
        <span className={`${styles.status} ${ready ? styles.statusReady : styles.statusWait}`}>
          <span className={styles.dotLive} /> {ready ? "Today's check-in is waiting" : 'Checked in for today'}
        </span>
      </div>

      <section className={styles.hero}>
        <ProgressRing value={streak.checkedIn / total} size={190} stroke={12}>
          <div className={`${styles.heroNum} tabular`}>{streak.currentStreak}</div>
          <span className={styles.heroUnit}>{streak.currentStreak === 1 ? 'DAY' : 'DAYS'}</span>
        </ProgressRing>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><Flame size={14} /> Current streak</div>
          <h2 className={styles.heroTitle}>{streak.checkedIn === 0 ? 'Check in today to start your streak.' : `${total - streak.checkedIn} day${total - streak.checkedIn === 1 ? '' : 's'} until the Ultimate Reward.`}</h2>
          <p className={styles.heroText}>Day {streak.currentDay} of {total} · {streak.checkedIn}/{total} claimed this cycle.</p>
          <div className={styles.heroActions}>
            {ready ? (
              <Button to="/daily-streak" size="lg"><Sparkles size={16} /> Check in now</Button>
            ) : (
              <>
                <Button to="/daily-streak" variant="ghost">View streak</Button>
                <span className={styles.next}><Lock size={12} style={{ verticalAlign: -1 }} /> Next reward in <b className="tabular">{countdown.label}</b></span>
              </>
            )}
          </div>
        </div>
      </section>

      {ovErr && !ov ? (
        <div className={p.card}><ErrorState title="Couldn't load your stats" message={ovErr.message} onRetry={reload} /></div>
      ) : !ov ? (
        <div className={p.grid4}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={150} r={22} />)}</div>
      ) : (
        <>
          <div className={p.grid4}>
            <Tile icon={Flame} tone="tGold" label="Current streak" value={ov.streak.current} sub="days active" />
            <Tile icon={Trophy} tone="tViolet" label="Longest streak" value={ov.streak.longest} sub="personal best" />
            <Tile icon={CalendarCheck} tone="tGreen" label="Total check-ins" value={ov.streak.totalCheckIns} sub="all time" />
            <Tile icon={Gift} tone="tViolet" label="VES earned" value={ov.rewards.vesEarned} sub={`${ov.rewards.vesEarnedThisWeek} this week`} />
          </div>

          <div className={styles.split}>
            <div className={p.card}>
              <div className={p.cardHead}>
                <div className={p.cardTitle}><TrendingUp size={18} /> VES earned, last 7 days</div>
                <span className={p.muted}>{ov.weekClaimedCount} of 7 days</span>
              </div>
              <div className={styles.week} style={{ marginBottom: 18 }}>
                {ov.week.map((d) => (
                  <div key={d.date} className={`${styles.day} ${d.isToday ? styles.dayToday : ''}`}>
                    <span className={styles.dayName}>{d.label}</span>
                    <span className={`${styles.dayDot} ${d.claimed ? styles.dayDone : ''}`}>{d.claimed ? '✓' : ''}</span>
                  </div>
                ))}
              </div>
              <div className={styles.chart} role="img" aria-label="VES earned per day over the last seven days">
                {ov.week.map((d) => (
                  <div key={d.date} className={styles.col}>
                    <div className={styles.barWrap}>
                      {d.vesEarned > 0 && <span className={`${styles.barVal} tabular`}>{d.vesEarned}</span>}
                      <div className={`${styles.bar} ${d.isToday ? styles.barToday : ''} ${d.vesEarned === 0 ? styles.barZero : ''}`} style={{ height: `${Math.max(3, (d.vesEarned / max) * 100)}%` }} />
                    </div>
                    <span className={styles.colLabel}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={p.card}>
              <div className={styles.profile}>
                <Avatar name={ov.profile.username} size={52} />
                <div>
                  <div className={styles.pName}>{ov.profile.username}</div>
                  <div className={styles.pMail}>{ov.profile.email}</div>
                  <div className={styles.pMail}>Member since {formatDate(ov.profile.memberSince)}</div>
                </div>
              </div>
              <div className={styles.mini}>
                <div className={styles.miniBox}><div className={styles.miniLabel}>Cycles done</div><div className={`${styles.miniVal} tabular`}>{ov.streak.cyclesCompleted}</div></div>
                <div className={styles.miniBox}><div className={styles.miniLabel}>Gift cards</div><div className={`${styles.miniVal} tabular`}>₹{ov.rewards.giftCardInr}</div></div>
              </div>
            </div>
          </div>

          <div className={p.card}>
            <div className={p.cardHead}><div className={p.cardTitle}><Activity size={18} /> Recent activity</div></div>
            {ov.recentActivity.length === 0 ? (
              <EmptyState icon={Activity} title="No activity yet" text="Your first check-in will show up here." action={<Button to="/daily-streak" size="sm">Start your streak</Button>} />
            ) : (
              <ul className={p.list}>
                {ov.recentActivity.map((a) => (
                  <li key={a.transactionId} className={p.item}>
                    <span className={`${p.itemIcon} ${a.currency === 'INR' ? p.tGold : p.tViolet}`}>{a.currency === 'INR' ? <Gift size={18} /> : <Flame size={18} />}</span>
                    <div className={p.itemMain}>
                      <div className={p.itemTitle}>Day {a.day} check-in</div>
                      <div className={p.itemSub}>{timeAgo(a.at)}</div>
                    </div>
                    <div className={`${p.itemAmt} ${a.currency === 'INR' ? p.inr : p.plus}`}>{rewardLabel(a)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
