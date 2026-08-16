import { useState } from 'react';
import { createStudyGoal } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

export function CreateGoalForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  if (!open) {
    return (
      <button className="btn btn-gradient glow" style={{ gap: '0.5rem' }} onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined">add</span>
        Nova Meta
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
          name: formData.get('name'),
          color: formData.get('color'),
          weekTarget: parseInt(formData.get('weekTarget'), 10),
        };
        try {
          await createStudyGoal(data);
          toast.success('Meta de estudo criada!');
          setOpen(false);
          onSuccess?.();
        } catch {
          toast.error('Erro ao criar meta de estudo');
        }
      }}
      className="glass-card"
      style={{ marginBottom: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Nova Meta de Estudo</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: 0 }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          name="name"
          type="text"
          placeholder="Nome da meta (ex: Programação, Inglês)"
          required
          autoFocus
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            name="color"
            type="text"
            defaultValue="#6366f1"
            placeholder="Cor (hex)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            name="weekTarget"
            type="number"
            defaultValue={5}
            min="1"
            placeholder="Meta semanal (horas)"
            required
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn btn-gradient">Criar Meta</button>
        </div>
      </div>
    </form>
  );
}

const inputStyle = {
  background: 'var(--surface-hover)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '0.625rem 0.75rem',
  color: 'var(--foreground)',
  fontSize: '0.9375rem',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
};
