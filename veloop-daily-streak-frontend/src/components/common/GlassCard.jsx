import styles from './GlassCard.module.css';

// Restrained glass surface. `tone` picks the edge colour; `as` changes the element.
export default function GlassCard({ as: Tag = 'div', tone = 'violet', padded = true, className = '', children, ...rest }) {
  const cls = [styles.card, styles[tone], padded ? styles.padded : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
