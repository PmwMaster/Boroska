import { useState } from 'react';
import { fetchTodaysWorkout, fetchWorkoutStats, toggleExercise, updateWorkoutStatus, createWorkout, deleteExercise, deleteWorkout } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { BodyMap } from '../components/ui/BodyMap.jsx';
import { MUSCLE_EXERCISES } from '../components/ui/ExerciseSuggestions.js';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import styles from './Treino.module.css';

const STATUS_MAP = {
  NOT_STARTED: { variant: 'default', label: 'Não iniciado' },
  IN_PROGRESS: { variant: 'warning-outline', label: 'Em andamento' },
  COMPLETED: { variant: 'success', label: 'Concluído' },
};

const MUSCLE_LABELS = {
  peito: 'Peito', ombro: 'Ombro', biceps: 'Bíceps', abdomen: 'Abdômen',
  quadriceps: 'Quadríceps', antebraco: 'Antebraço', trapezio: 'Trapézio',
  costas: 'Costas', triceps: 'Tríceps', gluteos: 'Glúteos',
  posterior: 'Posterior', panturrilha: 'Panturrilha',
};

export default function Treino() {
  const toast = useToast();
  const { data: workout, loading, error, reload } = useFetch(fetchTodaysWorkout);
  const { data: wStats } = useFetch(fetchWorkoutStats);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);

  const toggleMuscle = (muscle) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const generateWorkout = async () => {
    if (selectedMuscles.length === 0) return;
    setGenerating(true);
    const groupName = selectedMuscles.map(m => MUSCLE_LABELS[m] || m).join(' & ');
    const exercises = selectedMuscles.flatMap(m => MUSCLE_EXERCISES[m] || []);
    try {
      await createWorkout({ muscleGroup: groupName, exercises: exercises.map(ex => ({ name: ex.name, series: ex.series, repsMin: ex.repsMin, repsMax: ex.repsMax })) });
      toast.success(`Treino "${groupName}" criado!`);
      setSelectedMuscles([]);
      setShowBodyMap(false);
      reload();
    } catch { toast.error('Erro ao criar treino'); }
    finally { setGenerating(false); }
  };

  const handleToggleExercise = async (id) => {
    try { await toggleExercise(id); reload(); } catch { toast.error('Erro ao atualizar'); }
  };

  const handleDeleteExercise = async (id) => {
    if (!confirm('Excluir este exercício?')) return;
    try { await deleteExercise(id); toast.success('Exercício removido!'); reload(); } catch { toast.error('Erro ao remover'); }
  };

  const handleDeleteWorkout = async () => {
    if (!confirm('Excluir todo o treino?')) return;
    try { await deleteWorkout(workout.id); toast.success('Treino excluído!'); reload(); } catch { toast.error('Erro ao excluir'); }
  };

  const handleToggleStatus = async () => {
    const newStatus = workout.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    try { await updateWorkoutStatus(workout.id, newStatus); toast.success(newStatus === 'COMPLETED' ? 'Treino finalizado!' : 'Treino reaberto!'); reload(); } catch { toast.error('Erro'); }
  };

  if (loading) return <div className={styles.treino}><p style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '4rem 0' }}>Carregando...</p></div>;
  if (error) return (
    <div className={styles.treino}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Erro: {error}</p>
        <button onClick={reload} className="btn btn-secondary">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
          Tentar novamente
        </button>
      </div>
    </div>
  );

  const showBuilder = !workout || showBodyMap;

  if (showBuilder) {
    return (
      <div className={styles.treino}>
        <TutorialBox id="treino-intro" icon="fitness_center" title="Acompanhamento de Treino"
          steps={["Selecione os músculos no corpo para montar seu treino.", "Clique em 'Gerar Treino' para criar automaticamente.", "Marque os exercícios como concluídos ao terminar."]} />

        <header className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.headerTitle}>Montar Treino</h2>
            <p className="stat-label" style={{ marginTop: '0.25rem' }}>Selecione os grupos musculares no corpo</p>
          </div>
          {workout && (
            <button className="btn btn-ghost" onClick={() => setShowBodyMap(false)}>
              <span className="material-symbols-outlined">arrow_back</span>
              Voltar ao treino
            </button>
          )}
        </header>

        <div className={styles.bodyMapLayout}>
          <BodyMap selected={selectedMuscles} onToggle={toggleMuscle} />
          <div className={styles.musclePanel}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.75rem' }}>Músculos selecionados</h3>
            {selectedMuscles.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)', flex: 1 }}>Clique nas zonas do corpo para selecionar grupos musculares.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                  {selectedMuscles.map(m => (
                    <span key={m} className="chip chip-primary" style={{ cursor: 'pointer' }} onClick={() => toggleMuscle(m)}>{MUSCLE_LABELS[m] || m} ✕</span>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.75rem' }}>
                  {selectedMuscles.flatMap(m => MUSCLE_EXERCISES[m] || []).length} exercícios serão gerados
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '300px', overflow: 'auto' }}>
                  {selectedMuscles.flatMap(m => (MUSCLE_EXERCISES[m] || []).map((ex, i) => (
                    <div key={`${m}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{ex.name}</span>
                      <span style={{ color: 'var(--foreground-muted)' }}>{ex.series}x{ex.repsMin}-{ex.repsMax}</span>
                    </div>
                  )))}
                </div>
                <button onClick={generateWorkout} disabled={generating} className="btn btn-gradient" style={{ width: '100%', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>bolt</span>
                  {generating ? 'Gerando...' : 'Gerar Treino'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { exercises, muscleGroup, status } = workout;
  const totalSeries = exercises.reduce((sum, ex) => sum + ex.series, 0);
  const doneCount = exercises.filter((ex) => ex.isDone).length;
  const progress = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0;
  const estimatedMin = totalSeries * 3;
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.NOT_STARTED;

  return (
    <div className={styles.treino}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerRow}>
            <h2 className={styles.headerTitle}>{muscleGroup}</h2>
            <Chip variant={statusInfo.variant}>{statusInfo.label}</Chip>
          </div>
          <div className={styles.headerMeta}>
            <span>{exercises.length} exercícios</span>
            <span className={styles.metaDot} />
            <span>{totalSeries} séries</span>
            <span className={styles.metaDot} />
            <span>~{estimatedMin} min</span>
          </div>
        </div>
        <div className={styles.headerRight} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowBodyMap(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
            Novo
          </button>
          <button className="btn btn-gradient glow" onClick={handleToggleStatus}>
            <span className="material-symbols-outlined">check_circle</span>
            {status === 'COMPLETED' ? 'Reabrir' : 'Finalizar'}
          </button>
          <button onClick={handleDeleteWorkout} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', opacity: 0.5, padding: '0.25rem', lineHeight: 0 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--foreground-muted)'; }} title="Excluir treino">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>delete</span>
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <StatsCard icon="timer" iconBg="var(--info-bg)" label="Duração" value={`${estimatedMin} min`} chip={{ text: 'estimado', variant: 'info' }} />
        <StatsCard icon="local_fire_department" iconBg="var(--warning-bg)" label="Streak" value={wStats?.streak ? `${wStats.streak} dias` : '0 dias'} />
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>trending_up</span>
            </div>
          </div>
          <div>
            <p className="stat-label">Progresso</p>
            <div className={styles.statInline}>
              <span className={styles.statValueSm}>{progress}%</span>
              <span className={styles.statUnit}>do treino</span>
            </div>
            <div className={styles.statProgress}>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: 'var(--success)' }} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.exerciseColumn}>
          {exercises.map((ex, i) => (
            <div key={ex.id || i} className={`${styles.exerciseCard} ${i === 0 ? styles.exerciseCardActive : ''} ${ex.isDone ? styles.exerciseCardDone : ''}`}>
              <div className={styles.exerciseTrigger} onClick={() => handleToggleExercise(ex.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleToggleExercise(ex.id)}>
                <div className={`${styles.exerciseDot} ${ex.isDone ? styles.dotDone : i === 0 ? styles.dotActive : styles.dotPending}`}>
                  {ex.isDone ? <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>check</span> : i + 1}
                </div>
                <div className={styles.exerciseInfo}>
                  <span className={`${styles.exerciseName} ${ex.isDone ? styles.exerciseNameDone : ''}`}>{ex.name}</span>
                  <span className={styles.exerciseSub}>{ex.series} séries · {ex.repsMin}-{ex.repsMax} reps{ex.weight ? ` · ${ex.weight}kg` : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div className={styles.toggleExerciseBtn}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: ex.isDone ? 'var(--success)' : 'var(--foreground-muted)' }}>
                      {ex.isDone ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteExercise(ex.id); }} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', opacity: 0.3, padding: '0.125rem', lineHeight: 0 }}
                    onMouseEnter={e2 => { e2.currentTarget.style.opacity = '1'; e2.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={e2 => { e2.currentTarget.style.opacity = '0.3'; e2.currentTarget.style.color = 'var(--foreground-muted)'; }} title="Remover exercício">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
                  </button>
                </div>
              </div>
              {i === 0 && !ex.isDone && (
                <div className={styles.seriesTable}>
                  <div className={styles.tableHeader}><span>Série</span><span>Carga</span><span>Reps</span><span>Status</span></div>
                  {Array.from({ length: ex.series }, (_, j) => (
                    <div key={j} className={styles.tableRow}>
                      <span>{j + 1}ª série</span>
                      <span className={styles.tableWeight}>{ex.weight ? `${ex.weight}kg` : '--'}</span>
                      <span className={styles.tableReps}>{ex.repsMin}-{ex.repsMax} reps</span>
                      <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>Pendente</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
