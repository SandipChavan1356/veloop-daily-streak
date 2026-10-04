import Skeleton from '../common/Skeleton';
import styles from './StreakSkeleton.module.css';

// Mirrors the new silhouette: headline, the pass, the coupon, the index.
export default function StreakSkeleton() {
  return (
    <div className={styles.page} aria-hidden="true">
      <Skeleton h={16} w={150} />
      <Skeleton h={64} w="min(520px, 80%)" r={14} style={{ marginTop: 14 }} />
      <div className={styles.grid}>
        <Skeleton className={styles.card} r={28} h="auto" />
        <Skeleton className={styles.coupon} r={22} h="auto" />
      </div>
      <Skeleton h={44} w={260} r={12} style={{ marginTop: 56 }} />
      {[0, 1, 2].map((i) => (<Skeleton key={i} h={84} r={0} style={{ marginTop: 12 }} />))}
    </div>
  );
}
