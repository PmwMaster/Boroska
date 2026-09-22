export function EmptyState({ icon, title, action }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined empty-state-icon">{icon}</span>
      <p className="empty-state-text">{title}</p>
      {action}
    </div>
  );
}
