import { useId, useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import styles from './Auth.module.css';

// Labelled input with leading icon, validation states and (for passwords) a
// show/hide toggle. Purely presentational: the page owns value + validation.
export default function AuthField({ label, icon: Icon, type = 'text', error, valid, hint, className = '', ...input }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  const msgId = `${id}-msg`;

  return (
    <div className={`${styles.field} ${className}`}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={`${styles.inputWrap} ${error ? styles.invalid : ''} ${valid && !error ? styles.valid : ''}`}>
        <Icon size={17} className={styles.inputIcon} aria-hidden="true" />
        <input
          id={id}
          type={isPassword && shown ? 'text' : type}
          className={styles.input}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? msgId : undefined}
          {...input}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.trailing}
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            title={shown ? 'Hide password' : 'Show password'}
          >
            {shown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : valid && !error ? (
          <span className={`${styles.trailing} ${styles.okMark}`} aria-hidden="true">
            <Check size={16} strokeWidth={3} />
          </span>
        ) : null}
      </div>
      {(error || hint) && (
        <div id={msgId} className={error ? styles.fieldError : styles.fieldHint} role={error ? 'alert' : undefined}>
          {error || hint}
        </div>
      )}
    </div>
  );
}
