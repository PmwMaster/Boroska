export function SectionHeader({ icon, title, action }) {
  return (
    <div className="section-header">
      <h3 className="section-title">
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>{icon}</span>
        {title}
      </h3>
      {action?.onClick && (
        <button
          onClick={action.onClick}
          className="btn btn-ghost"
          style={{ fontSize: '0.875rem', fontWeight: 500 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
