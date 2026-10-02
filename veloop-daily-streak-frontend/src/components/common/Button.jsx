import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  full = false,
  size,
  className = '',
  children,
  to,
  ref,
  ...rest
}) {
  const cls = [
    styles.btn,
    styles[variant],
    full ? styles.full : '',
    size === 'sm' ? styles.sm : '',
    size === 'lg' ? styles.lg : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  );
}
