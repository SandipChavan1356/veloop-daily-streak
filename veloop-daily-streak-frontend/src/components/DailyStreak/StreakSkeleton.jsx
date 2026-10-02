import Skeleton from '../common/Skeleton';
import styles from './StreakSkeleton.module.css';

// Mirrors the new silhouette: identity · core · drop, then the trail.
export default function StreakSkeleton() {
  return (
    <div className={styles.page} aria-hidden="true">
      <div className={styles.stage}>
        <div className={styles.side}><Skeleton h={14} w={90} /><Skeleton h={64} w={160} /><Skeleton h={120} /></div>
        <Skeleton className={styles.core} r={999} h="auto" />
        <div className={styles.side}><Skeleton h={14} w={110} /><Skeleton h={150} /><Skeleton h={52} w={190} r={16} /></div>
      </div>
      <Skeleton h={28} w={160} style={{ marginTop: 20 }} />
      <Skeleton h={260} r={24} style={{ marginTop: 14 }} />
    </div>
  );
}
