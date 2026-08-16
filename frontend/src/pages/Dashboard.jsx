import { Link } from 'react-router-dom';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { TimelineItem } from '../components/ui/TimelineItem.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { CreateTaskForm } from '../components/ui/CreateTaskForm.jsx';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import { fetchDashboard, toggleRoutineBlock, updateWorkoutStatus } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import styles from './Dashboard.module.css';

const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function Dashboard() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(fetchDashboard);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-muted)' }}>Carregando...</div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Erro ao carregar: {error}</p>
      <button onClick={reload} className="btn btn-secondary">
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
        Tentar novamente
      </button>
    </div>
  );

  const { user, pendingTasks, highPriorityTasks, todaysRoutine, studyGoals, lastWorkout, finance, studyTodayMinutes, studyStreak = 0 } = data;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstPending = todaysRoutine.find((b) => !b.isCompleted);

  return (
    <div className={styles.dashboard}>
      <TutorialBox
        id="dashboard-intro"
        icon="dashboard"
        title="Bem-vindo ao Boroska!"
        steps={[
          'Este é seu painel central. Aqui você vê um resumo do seu dia.',
          'Acompanhe tarefas pendentes, rotina do dia, treino e progresso nos estudos.',
          "Clique em 'Nova tarefa' para começar a organizar seu dia.",
          'Use o menu lateral para navegar entre as seções.',
        ]}
      />

      {/* ── HEADER (sem card, aberto) ── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroGreeting}>{greeting}, {user.name.split(' ')[0]} &#x1F44B;</h1>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.miniDate}>
            <span className={styles.miniDateDay}>{dayNames[now.getDay()]}</span>
            <span className={styles.miniDateFull}>{now.getDate()} de {now.toLocaleString('pt-BR', { month: 'long' })}</span>
          </div>
          <CreateTaskForm onSuccess={reload} />
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className={styles.statsRow}>
        <StatsCard
          icon="checklist"
          iconBg="rgba(226, 138, 75, 0.12)"
          label="Pendentes"
          value={String(pendingTasks)}
          chip={{ text: `${highPriorityTasks} urg.`, variant: 'error' }}
        />
        <StatsCard
          icon="fitness_center"
          iconBg="var(--success-bg)"
          label="Treino"
          value={lastWorkout?.muscleGroup || '—'}
          chip={{ text: lastWorkout?.status === 'COMPLETED' ? 'Feito' : 'Pendente', variant: lastWorkout?.status === 'COMPLETED' ? 'success' : 'warning' }}
        />
        <StatsCard
          icon="timer"
          iconBg="var(--info-bg)"
          label="Estudo hoje"
          value={`${Math.floor(studyTodayMinutes / 60)}h ${studyTodayMinutes % 60}m`}
          chip={{ text: `${studyStreak}d streak`, variant: 'default' }}
        />
        <StatsCard
          icon="payments"
          iconBg="var(--warning-bg)"
          label="Saldo"
          value={`R$ ${Math.floor(finance.balance)}`}
          chip={{ text: `Semana R$${Math.floor(finance.weekExpenses)}`, variant: 'tertiary' }}
        />
      </div>

      {/* ── BENTO GRID: 2 colunas assimétricas ── */}
      <div className={styles.bento}>
        {/* COLUNA ESQUERDA (maior) */}
        <div className={styles.bentoLeft}>

          {/* Tarefas — sem card, com separadores finos */}
          <div style={{ marginBottom: '1.5rem' }}>
            <SectionHeader icon="task_alt" title="Tarefas de Hoje" />
            {todaysRoutine.filter((b) => !b.isCompleted).slice(0, 5).map((block, i) => (
              <div key={block.id} className={styles.taskRow}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try { await toggleRoutineBlock(block.id); toast.success('Concluído!'); reload(); } catch { toast.error('Erro'); }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                >
                  <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--foreground-muted)' }}>
                      check_box_outline_blank
                    </span>
                  </button>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--foreground)' }}>{block.title}</span>
                </form>
                <span className="chip chip-default" style={{ fontSize: '0.6875rem' }}>
                  {block.description || 'Pendente'}
                </span>
              </div>
            ))}
            {todaysRoutine.filter((b) => !b.isCompleted).length === 0 && (
              <p style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                Nenhuma tarefa pendente — ótimo trabalho!
              </p>
            )}
          </div>

          {/* Treino */}
          {!lastWorkout ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.5rem' }}>fitness_center</span>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Nenhum treino hoje.</p>
              <Link to="/treino" className="btn btn-secondary" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                Criar treino →
              </Link>
            </div>
          ) : (
            <div className={styles.workoutCard}>
              <div className={styles.woHeader}>
                <div>
                  <span className={styles.woLabel}>Treino de Hoje</span>
                  <h3 className={styles.woMuscle}>{lastWorkout.muscleGroup}</h3>
                </div>
                <span className={`chip chip-${lastWorkout.status === 'COMPLETED' ? 'success' : 'warning'}-outline`}>
                  {lastWorkout.status === 'COMPLETED' ? 'Concluído' : 'Não iniciado'}
                </span>
              </div>
              <div className={styles.woExercises}>
                {(lastWorkout.exercises ?? []).slice(0, 4).map((ex) => (
                  <div key={ex.id} className={styles.woExRow}>
                    <span>{ex.name}</span>
                    <span className={styles.woExMeta}>{ex.series}x{ex.repsMin}-{ex.repsMax}{ex.weight ? ` · ${ex.weight}kg` : ''}</span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try { await updateWorkoutStatus(lastWorkout.id, 'IN_PROGRESS'); toast.success('Treino iniciado!'); reload(); } catch { toast.error('Erro'); }
                }}
              >
                <button type="submit" className="btn btn-gradient" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>play_arrow</span>
                  Iniciar treino
                </button>
              </form>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA (menor) */}
        <div className={styles.bentoRight}>

          {/* Rotina */}
          <div className={styles.miniCard}>
            <SectionHeader icon="sync" title="Rotina" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todaysRoutine.slice(0, 5).map((block) => {
                const isActive = firstPending?.id === block.id;
                return (
                  <div key={block.id} className={styles.routineRow} style={{ opacity: block.isCompleted ? 0.4 : 1 }}>
                    <div className={`${styles.routineDot} ${block.isCompleted ? styles.routineDotDone : isActive ? styles.routineDotActive : ''}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.8125rem', fontWeight: block.isCompleted ? 400 : 600, color: 'var(--foreground)',
                        textDecoration: block.isCompleted ? 'line-through' : 'none', display: 'block',
                      }}>
                        {block.title}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--foreground-muted)' }}>
                        {block.startTime} – {block.endTime}
                      </span>
                    </div>
                    {isActive && !block.isCompleted && (
                      <span className="chip chip-tertiary" style={{ fontSize: '0.625rem' }}>agora</span>
                    )}
                  </div>
                );
              })}
              {todaysRoutine.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.8125rem', padding: '1rem 0' }}>
                  Nenhum bloco de rotina hoje.
                </p>
              )}
            </div>
          </div>

          {/* Metas de estudo */}
          <div className={styles.miniCard}>
            <SectionHeader icon="school" title="Metas" />
            {studyGoals.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>
                Nenhuma meta cadastrada.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studyGoals.slice(0, 3).map((g) => (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: g.color, display: 'inline-block', flexShrink: 0 }} />
                        {g.name}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>{g.progress}%</span>
                    </div>
                    <div className="progress-track" style={{ height: '4px' }}>
                      <div className="progress-fill" style={{ width: `${g.progress}%`, background: g.color }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>timer</span>
                    Hoje: {Math.floor(studyTodayMinutes / 60)}h {studyTodayMinutes % 60}m
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── META BANNER ── */}
      {(studyGoals[0]) && (
        <div className={styles.goalBar}>
          <div className={styles.goalBarLeft}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>track_changes</span>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>Meta Principal</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', display: 'block' }}>{studyGoals[0].name}</span>
            </div>
          </div>
          <div style={{ flex: '0 0 280px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--foreground-muted)' }}>Progresso</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{studyGoals[0].progress}%</span>
              </div>
              <div className="progress-track" style={{ height: '6px', background: 'var(--surface-bright)' }}>
                <div className="progress-fill gradient-bg" style={{ width: `${studyGoals[0].progress}%` }} />
              </div>
            </div>
            <Link to="/estudos" style={{ color: 'var(--foreground-muted)', lineHeight: 0 }}>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
