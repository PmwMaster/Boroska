export function ProgressBar({ label, percent, color, showPercent = true }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: color, display: 'inline-block' }} />
          {label}
        </span>
        {showPercent && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground-muted)', letterSpacing: '0.05em' }}>
            {percent}%
          </span>
        )}
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
