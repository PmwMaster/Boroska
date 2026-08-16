import styles from './StatsCard.module.css';

export function StatsCard({ icon, iconBg, label, value, chip }) {
  return (
    <div className="glass-card">
      <div className={styles.top}>
        <div className={styles.icon} style={{ backgroundColor: iconBg }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <div className={styles.valueRow}>
          <span className="stat-value">{value}</span>
          {chip && (
            <span className={`chip chip-${chip.variant}`}>{chip.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
