import { Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import p from '../Page.module.css';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  return (
    <div className={p.stack}>
      <PageHeader icon={Settings} title="Settings" />
      <div className={p.card}>
        <div className={p.cardTitle} style={{ marginBottom: 14 }}>Account</div>
        <div className={styles.field}><span>Name</span><b>{user?.username}</b></div>
        <div className={styles.field}><span>Email</span><b>{user?.email}</b></div>
        <p className={p.muted} style={{ marginTop: 10 }}>Editing account details isn&apos;t available yet.</p>
      </div>
      <div className={p.card}>
        <div className={p.cardTitle} style={{ marginBottom: 10 }}><ShieldCheck size={18} /> Security</div>
        <p className={p.muted}>Your streak, rewards and wallet are calculated and stored on the server. Nothing on this device can change them.</p>
      </div>
      <div className={p.card}>
        <div className={p.cardTitle} style={{ marginBottom: 12 }}>Session</div>
        <Button variant="danger" onClick={logout}><LogOut size={16} /> Log out</Button>
      </div>
    </div>
  );
}
