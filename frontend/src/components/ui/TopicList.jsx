import { useState } from 'react';
import { Chip } from './Chip.jsx';

const initialTopics = [
  { id: 1, label: 'Generics TS', checked: true, chip: { text: 'Teoria', variant: 'primary' }, time: '45min' },
  { id: 2, label: 'Layout Bento Grid', checked: true, chip: { text: 'Prática', variant: 'success' }, time: '1h 30min' },
  { id: 3, label: 'Leitura Artigo', checked: false, chip: { text: 'Leitura', variant: 'info' }, time: '30min' },
];

export function TopicList() {
  const [topics, setTopics] = useState(initialTopics);

  const toggle = (id) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)));
  };

  const doneCount = topics.filter((t) => t.checked).length;

  return (
    <>
      <div className="progress-track" style={{ marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: `${(doneCount / topics.length) * 100}%`, backgroundColor: 'var(--success)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => toggle(topic.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: '1px solid var(--border)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: topic.checked ? 'var(--primary-start)' : 'var(--foreground-muted)' }}>
              {topic.checked ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--foreground)', textDecoration: topic.checked ? 'line-through' : 'none', opacity: topic.checked ? 0.5 : 1 }}>
              {topic.label}
            </span>
            <Chip variant={topic.chip.variant}>{topic.chip.text}</Chip>
            <span style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>schedule</span>
              {topic.time}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
