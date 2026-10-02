import styles from './PageHeader.module.css';

export default function PageHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className={`${styles.head} vl-rise`}>
      <div className={styles.titleWrap}>
        {Icon && (
          <span className={styles.icon}>
            <Icon size={22} />
          </span>
        )}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
