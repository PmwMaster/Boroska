import { useState } from 'react';
import { createWorkout } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';

export function CreateWorkoutForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState([{ name: '', series: 3, repsMin: 8, repsMax: 12, weight: 0 }]);
  const toast = useToast();

  function addExercise() {
    setExercises([...exercises, { name: '', series: 3, repsMin: 8, repsMax: 12, weight: 0 }]);
  }

  function removeExercise(i) {
    setExercises(exercises.filter((_, idx) => idx !== i));
  }

  function updateExercise(i, field, value) {
    const updated = [...exercises];
    updated[i] = { ...updated[i], [field]: value };
    setExercises(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      muscleGroup: formData.get('muscleGroup'),
      notes: formData.get('notes') || null,
      exercises,
    };
    try {
      await createWorkout(data);
      toast.success('Treino criado!');
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao criar treino');
    }
  }

  if (!open) {
    return (
      <button className="btn btn-gradient glow" style={{ gap: '0.5rem' }} onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined">add</span>
        Novo Treino
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Novo Treino</h3>
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
          name="muscleGroup"
          type="text"
          placeholder="Grupo muscular (ex: Peito, Costas)"
          required
          autoFocus
          style={inputStyle}
        />

        <input
          name="notes"
          type="text"
          placeholder="Observações (opcional)"
          style={inputStyle}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground-muted)' }}>Exercícios</span>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.625rem' }}
              onClick={addExercise}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
              Adicionar
            </button>
          </div>

          {exercises.map((ex, i) => (
            <div key={i} style={{ padding: '0.625rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-hover)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <input
                  value={ex.name}
                  onChange={(e) => updateExercise(i, 'name', e.target.value)}
                  type="text"
                  placeholder="Nome do exercício"
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <input
                  value={ex.series}
                  onChange={(e) => updateExercise(i, 'series', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="Séries"
                  min="1"
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  value={ex.repsMin}
                  onChange={(e) => updateExercise(i, 'repsMin', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="Reps mín"
                  min="1"
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  value={ex.repsMax}
                  onChange={(e) => updateExercise(i, 'repsMax', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="Reps máx"
                  min="1"
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  value={ex.weight}
                  onChange={(e) => updateExercise(i, 'weight', parseFloat(e.target.value) || 0)}
                  type="number"
                  placeholder="Peso (kg)"
                  min="0"
                  step="0.5"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button type="submit" className="btn btn-gradient">Criar Treino</button>
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
