import { useState } from 'react';
import { createRoutine } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

const dayOptions = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export function CreateRoutineForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  if (!open) {
    return (
      <button className="btn btn-gradient glow" style={{ gap: '0.5rem' }} onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined">add</span>
        Novo Bloco
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        data.dayOfWeek = parseInt(data.dayOfWeek, 10);
        try {
          await createRoutine(data);
          toast.success('Bloco de rotina criado!');
          setOpen(false);
          onSuccess?.();
        } catch {
          toast.error('Erro ao criar bloco de rotina');
        }
      }}
      className="glass-card"
      style={{ marginBottom: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Novo Bloco de Rotina</h3>
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
          placeholder="Título (ex: Academia, Leitura)"
          required
          autoFocus
          style={inputStyle}
        />

        <select
          name="dayOfWeek"
          defaultValue={new Date().getDay()}
          style={inputStyle}
        >
          {dayOptions.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            name="startTime"
            type="text"
            defaultValue="08:00"
            placeholder="Início (HH:MM)"
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            name="endTime"
            type="text"
            defaultValue="12:00"
            placeholder="Fim (HH:MM)"
            required
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <input
          name="description"
          type="text"
          placeholder="Descrição (opcional)"
          style={inputStyle}
        />

        <input
          name="icon"
          type="text"
          placeholder="Ícone Material Symbol (ex: fitness_center)"
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn btn-gradient">Criar Bloco</button>
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
