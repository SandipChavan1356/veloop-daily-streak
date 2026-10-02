import { NavLink } from 'react-router-dom';
import { Flame, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStreakData } from '../../context/StreakDataContext';
import Logo from '../common/Logo';
import { NAV_GROUPS } from './navItems';
import styles from './Sidebar.module.css';

// Desktop: a slim icon rail (76px) that expands over the content on hover/focus.
// <1024px: the same markup is the slide-in drawer, always showing labels.
export default function Sidebar({ open = false, onClose }) {
  const { logout } = useAuth();
  const { streak } = useStreakData();

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOn : ''}`} onClick={onClose} aria-hidden="true" />
      <div className={styles.rail}>
        <aside className={`${styles.panel} ${open ? styles.open : ''}`} aria-label="Primary">
          <div className={styles.head}>
            <Logo compact />
            <span className={styles.word}>VELoop</span>
            <button className={styles.close} onClick={onClose} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <nav className={styles.nav}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} className={styles.group}>
                {gi > 0 && <span className={styles.rule} aria-hidden="true" />}
                <div className={styles.groupLabel}>{group.label}</div>
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    title={label}
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.ico}>
                      <Icon size={20} strokeWidth={1.9} />
                    </span>
                    <span className={styles.txt}>{label}</span>
                    {to === '/daily-streak' && streak?.eligibleNow && (
                      <span className={styles.ready} title="Today's drop is ready">
                        <span className="sr-only">Reward ready</span>
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.foot}>
            <NavLink to="/daily-streak" onClick={onClose} className={styles.chain} title="Your streak">
              <span className={styles.chainIco}><Flame size={18} /></span>
              <span className={`${styles.chainNum} tabular`}>{streak?.currentStreak ?? 0}</span>
              <span className={styles.txt}>day chain</span>
            </NavLink>
            <button className={`${styles.link} ${styles.logout}`} onClick={logout} title="Log out">
              <span className={styles.ico}><LogOut size={19} strokeWidth={1.9} /></span>
              <span className={styles.txt}>Log out</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
