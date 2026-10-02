import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastList } from '../../context/ToastContext';
import styles from './Toast.module.css';

const icons = { success: CheckCircle2, error: XCircle, info: Info };

export default function ToastStack() {
  const { toasts, dismiss } = useToastList();

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.variant] || Info;
        return (
          <div key={t.id} className={`${styles.toast} ${styles[t.variant] || ''}`}>
            <Icon size={18} className={styles.icon} />
            <span>{t.message}</span>
            <button className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
