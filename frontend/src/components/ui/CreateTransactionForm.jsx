import { useState } from 'react';
import { createTransaction } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

const categories = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'salario', label: 'Salário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'outros', label: 'Outros' },
];

const types = [
  { value: 'INCOME', label: 'Entrada' },
  { value: 'EXPENSE', label: 'Saída' },
];

export function CreateTransactionForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type: formData.get('type'),
      category: formData.get('category'),
      amount: parseFloat(formData.get('amount')),
      description: formData.get('description'),
      date: new Date().toISOString(),
    };
    try {
      await createTransaction(data);
      toast.success('Transação registrada!');
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao registrar');
    }
  }

  if (!open) {
    return (
      <button className="btn btn-gradient glow" style={{ gap: '0.5rem' }} onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined">add</span>
        Nova Transação
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card"
      style={{ marginBottom: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Nova Transação</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: 0 }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            name="type"
            defaultValue="EXPENSE"
            style={{
              flex: 1,
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.625rem 0.75rem',
              color: 'var(--foreground)',
              fontSize: '0.9375rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <select
            name="category"
            defaultValue="outros"
            style={{
              flex: 1,
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.625rem 0.75rem',
              color: 'var(--foreground)',
              fontSize: '0.9375rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Valor (R$)"
          required
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
          name="description"
          type="text"
          placeholder="Descrição"
          required
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

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn btn-gradient">Registrar</button>
        </div>
      </div>
    </form>
  );
}
