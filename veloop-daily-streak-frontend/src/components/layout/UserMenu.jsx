import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOutsideClose } from '../../hooks/useOutsideClose';
import styles from './UserMenu.module.css';

export function Avatar({ name = '?', size = 34 }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="true">
        <Avatar name={user?.username} />
        <span className={styles.name}>{user?.username}</span>
        <ChevronDown size={15} className={open ? styles.flip : ''} />
      </button>
      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.who}>
            <div className={styles.whoName}>{user?.username}</div>
            <div className={styles.whoMail}>{user?.email}</div>
          </div>
          <Link to="/profile" className={styles.item} onClick={() => setOpen(false)} role="menuitem">
            <User size={16} /> Profile
          </Link>
          <Link to="/settings" className={styles.item} onClick={() => setOpen(false)} role="menuitem">
            <Settings size={16} /> Settings
          </Link>
          <button className={`${styles.item} ${styles.danger}`} onClick={logout} role="menuitem">
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
