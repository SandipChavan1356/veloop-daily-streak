import { Target, Check } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as insightsApi from '../../services/insightsApi';
import PageHeader from '../../components/common/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import { iconFor } from '../../utils/iconMap';
import p from '../Page.module.css';
import styles from './Milestones.module.css';

const fmt = (m, n) => (m.unit === '₹' ? `₹${n}` : `${n} ${m.unit}`);

export default function MilestonesPage() {
  const { data, error, reload } = useAsync(insightsApi.getMilestones);

  return (
    <div className={p.stack}>
      <PageHeader icon={Target} title="Milestones" subtitle="Every ladder you're climbing, and what's next on each." />
      {error ? (
        <div className={p.card}><ErrorState title="Couldn't load milestones" message={error.message} onRetry={reload} /></div>
      ) : !data ? (
        <div className={p.grid2}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={210} r={22} />)}</div>
      ) : (
        <div className={p.grid2}>
          {data.milestones.map((m) => {
            const Icon = iconFor(m.icon);
            return (
              <div key={m.key} className={p.card}>
                <div className={p.cardHead}>
                  <div className={p.cardTitle}><Icon size={18} /> {m.title}</div>
                  <span className={`${styles.cur} tabular`}>{fmt(m, m.current)}</span>
                </div>
                <div className={styles.bar}><div className={styles.fill} style={{ width: `${m.percentToNext}%` }} /></div>
                <div className={styles.next}>
                  {m.next ? <>Next: <b>{fmt(m, m.next.target)}</b> · {fmt(m, m.next.remaining)} to go</> : <b className={styles.max}>All steps complete 🎉</b>}
                </div>
                <ol className={styles.steps}>
                  {m.steps.map((s) => (
                    <li key={s.target} className={`${styles.step} ${s.reached ? styles.reached : ''}`}>
                      <span className={styles.node}>{s.reached ? <Check size={12} strokeWidth={3.4} /> : null}</span>
                      <span className="tabular">{s.target}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
