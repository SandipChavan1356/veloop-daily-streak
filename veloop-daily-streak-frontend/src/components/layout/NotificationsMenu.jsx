import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Flame, AlertTriangle, Lock } from 'lucide-react';
import { useOutsideClose } from '../../hooks/useOutsideClose';
import { buildNotifications } from './notifications';
import styles from './NotificationsMenu.module.css';

const ICONS = { gold: Flame, red: AlertTriangle, violet: Lock };

export default function NotificationsMenu({ streak }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));
  const items = buildNotifications(streak);
  const actionable = items.some((i) => i.tone === 'gold' || i.tone === 'red');

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.bell}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={18} />
        {actionable && <span className={styles.dot} />}
      </button>
      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.head}>Notifications</div>
          {items.length === 0 && <div className={styles.empty}>You&apos;re all caught up.</div>}
          {items.map((n) => {
            const Icon = ICONS[n.tone] || Flame;
            return (
              <Link key={n.id} to={n.to} className={styles.item} onClick={() => setOpen(false)} role="menuitem">
                <span className={`${styles.icon} ${styles[n.tone]}`}>
                  <Icon size={16} />
                </span>
                <span>
                  <span className={styles.title}>{n.title}</span>
                  <span className={styles.body}>{n.body}</span>
                </span>
              </Link>
            );
          })}
          <div className={styles.foot}>Live from your streak status.</div>
        </div>
      )}
    </div>
  );
}
