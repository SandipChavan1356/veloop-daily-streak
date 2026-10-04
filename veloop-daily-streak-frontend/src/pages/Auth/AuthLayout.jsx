import AnimatedBackground from '../../components/common/AnimatedBackground';
import Logo from '../../components/common/Logo';
import PassCard from '../../components/DailyStreak/PassCard';
import styles from './Auth.module.css';

// Decorative preview only (pre-login there is no user data): a representative pass.
const DEMO = [
  { day: 1, state: 'claimed' }, { day: 2, state: 'claimed' }, { day: 3, state: 'claimed' },
  { day: 4, state: 'today', art: 'giftBurst' }, { day: 5, state: 'locked' }, { day: 6, state: 'locked' }, { day: 7, state: 'locked', vip: true },
];

// Editorial split: the Streak Pass floats in an obsidian room on the left,
// a flat sign-in column on the right. On phones the pass heads a bottom sheet.
export default function AuthLayout({ children }) {
  return (
    <div className={styles.page}>
      <AnimatedBackground variant="auth" />

      <section className={styles.stage} aria-label="VELoop Rewards">
        <div className={styles.brand}><Logo to="/login" /></div>
        <div className={styles.passBox} aria-hidden="true">
          <PassCard slots={DEMO} holder="Your name" day={4} total={7} days={3} />
        </div>
        <div className={styles.statement}>
          <h2 className={styles.headline}>Your pass is waiting.</h2>
          <p className={styles.lede}>Seven days. Bigger drops. One final vault.</p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.sheet}>{children}</div>
      </section>
    </div>
  );
}
