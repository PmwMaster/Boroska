import { useState } from 'react';
import { Chip } from './Chip.jsx';

export function TaskItem({ label, chip, checked, onToggle }) {
  const [pending, setPending] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    setPending(true);
    try {
      await onToggle();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="list-item">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: pending ? 'wait' : 'pointer',
          lineHeight: 0,
          opacity: pending ? 0.5 : 1,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '1.25rem',
            color: checked ? 'var(--primary-start)' : 'var(--foreground-muted)',
          }}
        >
          {pending ? 'hourglass_top' : checked ? 'check_box' : 'check_box_outline_blank'}
        </span>
      </button>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1rem', color: 'var(--foreground)' }}>{label}</span>
        {chip && <Chip variant={chip.variant}>{chip.text}</Chip>}
      </div>
    </div>
  );
}
