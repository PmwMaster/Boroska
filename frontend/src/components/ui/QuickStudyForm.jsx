import { useState } from 'react';
import { createStudySession } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

const subjects = ['Programação', 'Design', 'Inglês', 'Matemática', 'Outros'];

export function QuickStudyForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      subject: formData.get('subject'),
      topic: formData.get('topic'),
      duration: parseInt(formData.get('duration'), 10),
    };
    try {
      await createStudySession(data);
      toast.success('Sessão iniciada!');
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao iniciar sessão');
    }
  }

  if (!open) {
    return (
      <button className="btn btn-gradient glow" style={{ gap: '0.5rem' }} onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>play_arrow</span>
        Iniciar Sessão
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Nova Sessão de Estudo</h3>
        <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: 0 }}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <select name="subject" defaultValue="Programação" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.625rem 0.75rem', color: 'var(--foreground)', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' }}>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="topic" type="text" placeholder="O que vai estudar?" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.625rem 0.75rem', color: 'var(--foreground)', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' }} />
        <input name="duration" type="number" defaultValue={30} min={5} placeholder="Duração (minutos)" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.625rem 0.75rem', color: 'var(--foreground)', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' }} />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn btn-gradient">Começar</button>
        </div>
      </div>
    </form>
  );
}
