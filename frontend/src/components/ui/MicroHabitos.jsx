import { useState } from 'react';

const initialHabits = [
  { id: 1, label: 'Beber 2L de água', done: true },
  { id: 2, label: 'Alongamento matinal', done: true },
  { id: 3, label: 'Diário de gratidão', done: false },
  { id: 4, label: 'Meditar 10 min', done: true },
  { id: 5, label: 'Ler 20 páginas', done: false },
];

export function MicroHabitos() {
  const [habits, setHabits] = useState(initialHabits);

  const toggle = (id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {habits.map((h) => (
        <label
          key={h.id}
          onClick={() => toggle(h.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'border 0.2s',
            border: '1px solid transparent',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '1.25rem',
              color: h.done ? 'var(--primary-start)' : 'var(--foreground-muted)',
            }}
          >
            {h.done ? 'check_box' : 'check_box_outline_blank'}
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              color: 'var(--foreground)',
              textDecoration: h.done ? 'line-through' : 'none',
              opacity: h.done ? 0.6 : 1,
            }}
          >
            {h.label}
          </span>
        </label>
      ))}
    </div>
  );
}
