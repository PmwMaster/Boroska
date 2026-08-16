const variantStyles = {
  success: {
    bar: '#22c55e',
    bg: '#14532d',
    icon: 'check_circle',
  },
  error: {
    bar: '#ef4444',
    bg: '#7f1d1d',
    icon: 'error',
  },
  info: {
    bar: '#3b82f6',
    bg: '#1e3a5f',
    icon: 'info',
  },
};

function Toast({ toast, onClose }) {
  const v = variantStyles[toast.type] || variantStyles.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        minWidth: '300px',
        maxWidth: '420px',
        padding: '0.75rem 0.875rem',
        borderRadius: 'var(--radius-lg)',
        background: v.bg,
        borderLeft: `4px solid ${v.bar}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        color: '#f1f5f9',
        fontSize: '0.875rem',
        animation: 'toastSlideIn 0.3s ease-out',
        pointerEvents: 'auto',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '1.25rem', color: v.bar, flexShrink: 0 }}
      >
        {v.icon}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '0.125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, remove }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </>
  );
}
