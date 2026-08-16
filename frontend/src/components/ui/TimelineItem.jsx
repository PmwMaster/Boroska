import styles from './TimelineItem.module.css';

export function TimelineItem({ icon, label, time, description, status = 'pending' }) {
  return (
    <div className={styles.item}>
      <div className={`timeline-dot timeline-dot--${status}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className={`${styles.content} ${status === 'active' ? styles.activeBlock : ''} ${status === 'completed' ? styles.completed : ''}`}>
        <div className={styles.header}>
          <span className={`${styles.label} ${status === 'active' ? styles.labelActive : ''}`}>{label}</span>
          <span className={styles.time}>{time}</span>
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
}
