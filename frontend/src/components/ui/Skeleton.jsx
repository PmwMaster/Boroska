export function PageSkeleton({ cards = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="skeleton" style={{ width: '220px', height: '1.75rem', marginBottom: '0.625rem' }} />
          <div className="skeleton" style={{ width: '320px', height: '1rem' }} />
        </div>
        <div className="skeleton" style={{ width: '140px', height: '2.5rem', borderRadius: 'var(--radius-lg)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '96px', borderRadius: 'var(--radius-2xl)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-2xl)' }} />
    </div>
  );
}
