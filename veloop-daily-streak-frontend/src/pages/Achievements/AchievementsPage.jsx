import { Award, Lock, Check } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as insightsApi from '../../services/insightsApi';
import PageHeader from '../../components/common/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import { iconFor } from '../../utils/iconMap';
import p from '../Page.module.css';
import styles from './Achievements.module.css';

export default function AchievementsPage() {
  const { data, error, reload } = useAsync(insightsApi.getAchievements);

  return (
    <div className={p.stack}>
      <PageHeader icon={Award} title="Achievements" subtitle={data ? `${data.unlocked} of ${data.total} unlocked` : 'Badges you earn along the way.'} />
      {error ? (
        <div className={p.card}><ErrorState title="Couldn't load achievements" message={error.message} onRetry={reload} /></div>
      ) : !data ? (
        <div className={p.grid4}>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={190} r={22} />)}</div>
      ) : (
        <>
          <div className={styles.overall}>
            <div className={styles.overallBar}><div className={styles.overallFill} style={{ width: `${(data.unlocked / data.total) * 100}%` }} /></div>
            <span className="tabular">{data.unlocked}/{data.total}</span>
          </div>
          <div className={p.grid4}>
            {data.achievements.map((a, i) => {
              const Icon = iconFor(a.icon);
              return (
                <div key={a.key} className={`${styles.badge} ${a.unlocked ? styles.on : ''} ${styles[a.tier]}`} style={{ animationDelay: `${i * 50}ms` }}>
                  <div className={styles.medal}>
                    <Icon size={26} />
                    <span className={styles.state}>{a.unlocked ? <Check size={11} strokeWidth={3.4} /> : <Lock size={10} />}</span>
                  </div>
                  <div className={styles.title}>{a.title}</div>
                  <div className={styles.desc}>{a.description}</div>
                  <div className={styles.prog}>
                    <div className={styles.progBar}><div className={styles.progFill} style={{ width: `${(a.progress / a.target) * 100}%` }} /></div>
                    <span className="tabular">{a.progress}/{a.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
