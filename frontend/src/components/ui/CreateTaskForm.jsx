import { useState } from 'react';
import { createTask } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

const categories = ['Trabalho', 'Estudos', 'Pessoal', 'Finanças', 'Casa', 'Hábito', 'Geral'];
const priorities = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW', label: 'Baixa' },
];

export function CreateTaskForm({ variant = 'inline', onSuccess }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  if (!open) {
    return (
      <button className="btn btn-gradient glow" style={{ gap: '0.5rem' }} onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined">add</span>
        Nova tarefa
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        try {
          await createTask(data);
          toast.success('Tarefa criada!');
          setOpen(false);
          onSuccess?.();
        } catch {
          toast.error('Erro ao criar tarefa');
        }
      }}
      className="glass-card"
      style={variant === 'modal' ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        width: '90%',
        maxWidth: '480px',
      } : { marginBottom: '1rem' }}
    >
      {variant === 'modal' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: -1,
          }}
          onClick={() => setOpen(false)}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Nova Tarefa</h3>
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
          name="title"
          type="text"
          placeholder="Título da tarefa"
          required
          autoFocus
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.625rem 0.75rem',
            color: 'var(--foreground)',
            fontSize: '0.9375rem',
            outline: 'none',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />

        <input
          name="dueDate"
          type="date"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.5rem 0.75rem',
            color: 'var(--foreground)',
            fontSize: '0.875rem',
            outline: 'none',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            name="category"
            defaultValue="Geral"
            style={{
              flex: 1,
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.5rem 0.75rem',
              color: 'var(--foreground)',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            name="priority"
            defaultValue="MEDIUM"
            style={{
              flex: 1,
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.5rem 0.75rem',
              color: 'var(--foreground)',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn btn-gradient">Criar Tarefa</button>
        </div>
      </div>
    </form>
  );
}
