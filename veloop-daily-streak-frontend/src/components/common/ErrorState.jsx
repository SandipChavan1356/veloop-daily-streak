import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import styles from './ErrorState.module.css';

export default function ErrorState({ title = 'Unable to load your streak', message, onRetry }) {
  return (
    <div className={styles.wrap}>
      <AlertTriangle size={40} className={styles.icon} />
      <div className={styles.title}>{title}</div>
      {message && <div className={styles.msg}>{message}</div>}
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
