import { Trophy, Flame, Crown } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as insightsApi from '../../services/insightsApi';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import { Avatar } from '../../components/layout/UserMenu';
import p from '../Page.module.css';
import styles from './Leaderboard.module.css';

const getBoard = () => insightsApi.getLeaderboard(10);

export default function LeaderboardPage() {
  const { data, error, reload } = useAsync(getBoard);
  const top3 = data?.leaderboard.slice(0, 3) ?? [];
  // podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className={p.stack}>
      <PageHeader icon={Trophy} title="Leaderboard" subtitle="Ranked by best streak, then total check-ins." />
      {error ? (
        <div className={p.card}><ErrorState title="Couldn't load the leaderboard" message={error.message} onRetry={reload} /></div>
      ) : !data ? (
        <Skeleton h={360} r={22} />
      ) : data.leaderboard.length === 0 ? (
        <div className={p.card}><EmptyState icon={Trophy} title="No one is on the board yet" text="Claim a reward to take the first spot." action={<Button to="/daily-streak" size="sm">Start your streak</Button>} /></div>
      ) : (
        <>
          <div className={styles.podium}>
            {podium.map((r) => (
              <div key={r.rank} className={`${styles.pod} ${styles[`r${r.rank}`]} ${r.isYou ? styles.you : ''}`}>
                {r.rank === 1 && <Crown size={22} className={styles.crown} />}
                <Avatar name={r.username} size={r.rank === 1 ? 62 : 50} />
                <div className={styles.pName}>{r.username}{r.isYou && ' (you)'}</div>
                <div className={styles.pStreak}><Flame size={14} /> <span className="tabular">{r.bestStreak}</span></div>
                <div className={styles.block}>#{r.rank}</div>
              </div>
            ))}
          </div>

          <div className={p.card}>
            <div className={p.cardHead}>
              <div className={p.cardTitle}><Trophy size={18} /> Top players</div>
              <span className={p.muted}>{data.totalPlayers} playing</span>
            </div>
            <ul className={p.list}>
              {data.leaderboard.map((r) => (
                <li key={r.rank} className={`${p.item} ${r.isYou ? styles.meRow : ''}`}>
                  <span className={`${styles.rank} tabular`}>{r.rank}</span>
                  <Avatar name={r.username} size={38} />
                  <div className={p.itemMain}>
                    <div className={p.itemTitle}>{r.username}{r.isYou && <span className={`${p.chip} ${p.chipDone}`}>You</span>}</div>
                    <div className={p.itemSub}>{r.totalCheckIns} check-ins</div>
                  </div>
                  <div className={`${p.itemAmt} ${p.inr}`}><Flame size={14} style={{ verticalAlign: -2 }} /> <span className="tabular">{r.bestStreak}</span></div>
                </li>
              ))}
            </ul>
            {data.me && data.me.rank > data.leaderboard.length && (
              <div className={styles.myRank}>Your rank: <b>#{data.me.rank}</b> · best streak {data.me.bestStreak}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
