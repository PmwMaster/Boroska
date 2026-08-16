import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ritmo-tutorials-dismissed';

function isDismissed(id) {
  try {
    const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return !!dismissed[id];
  } catch { return false; }
}

function setDismissed(id) {
  try {
    const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    dismissed[id] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  } catch {}
}

export function TutorialBox({ id, icon, title, steps }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDismissed(id)) {
      setVisible(true);
    }
  }, [id]);

  if (!visible) return null;

  const dismiss = () => {
    setDismissed(id);
    setVisible(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--primary-start)',
        borderRadius: 'var(--radius-2xl)',
        padding: '1.25rem 1.25rem 1rem',
        marginBottom: '1.25rem',
      }}
    >
      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          top: '0.625rem',
          right: '0.75rem',
          background: 'none',
          border: 'none',
          color: 'var(--foreground-muted)',
          cursor: 'pointer',
          padding: '2px',
          lineHeight: 0,
          opacity: 0.5,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        title="Fechar tutorial"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '1.5rem', color: 'var(--primary-start)' }}
        >
          {icon}
        </span>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>{title}</h3>
        <span
          className="chip chip-primary"
          style={{ marginLeft: 'auto', fontSize: '0.6875rem' }}
        >
          Tutorial
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: 'var(--foreground-muted)',
              lineHeight: '1.4',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(226, 138, 75, 0.12)',
                color: 'var(--primary-start)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 700,
                marginTop: '1px',
              }}
            >
              {i + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
        <button
          onClick={dismiss}
          className="btn btn-ghost"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
