import styles from './EmptyState.module.css';

export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className={styles.wrap}>
      {Icon && (
        <div className={styles.icon}>
          <Icon size={26} />
        </div>
      )}
      <div className={styles.title}>{title}</div>
      {text && <div className={styles.text}>{text}</div>}
      {action}
    </div>
  );
}
