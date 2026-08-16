import { useState } from 'react';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { TimelineItem } from '../components/ui/TimelineItem.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { QuickStudyForm } from '../components/ui/QuickStudyForm.jsx';
import { CreateGoalForm } from '../components/ui/CreateGoalForm.jsx';
import { fetchStudyStats, fetchStudyGoals, fetchStudySessions, updateStudyGoal, deleteStudyGoal } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import styles from './Estudos.module.css';

const CIRCLE_R = 54;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getStatusFromProgress(progress) {
  if (progress >= 80) return { label: 'Em dia', variant: 'success' };
  if (progress >= 50) return { label: 'Atenção', variant: 'warning' };
  return { label: 'Atrasado', variant: 'error' };
}

function getSubjectIcon(subject) {
  const map = {
    'Programação': 'code',
    'Design': 'grid_view',
    'Inglês': 'translate',
    'Matemática': 'calculate',
  };
  return map[subject] || 'auto_stories';
}

function timeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHrs < 1) return 'Agora';
  if (diffHrs < 24) return `${diffHrs}h atrás`;
  if (diffDays === 1) return 'Ontem';
  return `${diffDays} dias atrás`;
}

export default function Estudos() {
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);

  const { data: studyStats, loading: statsLoading, error: statsError, reload } = useFetch(fetchStudyStats);
  const { data: goals, loading: goalsLoading, error: goalsError, reload: reloadGoals } = useFetch(fetchStudyGoals);
  const { data: sessions, loading: sessionsLoading, error: sessionsError, reload: reloadSessions } = useFetch(() => fetchStudySessions(5));

  const reloadAll = () => { reload(); reloadGoals(); reloadSessions(); };

  const loading = statsLoading || goalsLoading || sessionsLoading;
  const error = statsError || goalsError || sessionsError;

  if (loading) {
    return (
      <div className={styles.estudos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1rem' }}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.estudos} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '1rem' }}>Erro ao carregar: {error}</p>
        <button onClick={reloadAll} className="btn btn-secondary">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
          Tentar novamente
        </button>
      </div>
    );
  }

  const firstGoal = goals[0] ?? { weekDone: 0, weekTarget: 1 };
  const weekTarget = firstGoal.weekTarget || 1;
  const weeklyPercent = Math.min(Math.round((firstGoal.weekDone / weekTarget) * 100), 100);
  const dashoffset = CIRCLE_C * (1 - weeklyPercent / 100);

  const weeklyDaysFilled = Math.min(Math.round((weeklyPercent / 100) * 7), 7);

  return (
    <div className={styles.estudos}>
      <TutorialBox
        id="estudos-intro"
        icon="school"
        title="Central de Estudos"
        steps={[
          "Acompanhe seu progresso nos estudos com metas e sessões.",
          "Clique em 'Iniciar Sessão' para registrar tempo de estudo.",
          "Adicione metas de estudo para acompanhar seu progresso em cada matéria.",
          "Use 🗑️ para remover metas ou sessões antigas.",
        ]}
      />

      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Estudos</h2>
          <p className={styles.subtitle}>Acompanhe seu progresso e continue evoluindo.</p>
        </div>
        <QuickStudyForm onSuccess={reload} />
      </header>

      <div className={styles.statsGrid}>
        <StatsCard
          icon="timer"
          iconBg="var(--info-bg)"
          label="Tempo Hoje"
          value={formatMinutes(studyStats.todayMinutes)}
        />
        <StatsCard
          icon="local_fire_department"
          iconBg="var(--warning-bg)"
          label="Streak"
          value={`${studyStats.streak} dias`}
        />
        <StatsCard
          icon="code"
          iconBg="var(--primary)"
          label="Progresso Projeto"
          value={`${studyStats.projectProgress}%`}
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.column}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <SectionHeader
                icon="route"
                title="Trilha de Estudo Atual"
              />
              <CreateGoalForm onSuccess={reloadGoals} />
            </div>
            {goals.map((goal) => (
              editingId === goal.id ? (
                <EditGoalForm
                  key={goal.id}
                  goal={goal}
                  onSave={async (data) => {
                    try {
                      await updateStudyGoal(goal.id, data);
                      toast.success('Meta atualizada!');
                      setEditingId(null);
                      reloadGoals();
                    } catch {
                      toast.error('Erro ao atualizar meta');
                    }
                  }}
                  onCancel={() => setEditingId(null)}
                  onDelete={async () => {
                    try {
                      await deleteStudyGoal(goal.id);
                      toast.success('Meta removida!');
                      setEditingId(null);
                      reloadGoals();
                    } catch {
                      toast.error('Erro ao remover meta');
                    }
                  }}
                />
              ) : (
                <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ flex: 1 }}>
                    <ProgressBar
                      label={goal.name}
                      percent={goal.progress}
                      color={goal.color}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingId(goal.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', lineHeight: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit</span>
                  </button>
                </div>
              )
            ))}
            {goals.length === 0 && (
              <p className="stat-label" style={{ textAlign: 'center', padding: '1rem 0' }}>
                Nenhuma meta de estudo cadastrada.
              </p>
            )}
          </div>
        </div>

        <div className={styles.column}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <SectionHeader icon="donut_large" title="Progresso da Semana" />
            <div className={styles.circleWrap}>
              <svg viewBox="0 0 128 128" className={styles.circleSvg}>
                <circle
                  cx="64"
                  cy="64"
                  r={CIRCLE_R}
                  fill="none"
                  stroke="var(--surface-hover)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={CIRCLE_R}
                  fill="none"
                  stroke="url(#circleGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCLE_C}
                  strokeDashoffset={dashoffset}
                  transform="rotate(-90 64 64)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
                <defs>
                  <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary-start)" />
                    <stop offset="100%" stopColor="var(--primary-end)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className={styles.circleLabel}>
                <span className={styles.circleHours}>{firstGoal.weekDone}h</span>
                <span className={styles.circleTarget}>/{firstGoal.weekTarget}h</span>
              </div>
            </div>
            <div className={styles.weeklyDays}>
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                <div
                  key={i}
                  className={styles.weeklyDay}
                  style={{
                    backgroundColor: i < weeklyDaysFilled ? 'var(--primary)' : 'var(--surface-bright)',
                    opacity: i < weeklyDaysFilled ? 1 : 0.4,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <SectionHeader icon="category" title="Matérias" />
            <div className={styles.subjectList}>
              {goals.map((goal) => {
                const status = getStatusFromProgress(goal.progress);
                return (
                  <div key={goal.id} className={styles.subjectItem}>
                    <span
                      className={styles.subjectDot}
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className={styles.subjectName}>{goal.name}</span>
                    <Chip variant={status.variant}>{status.label}</Chip>
                  </div>
                );
              })}
              {goals.length === 0 && (
                <p className="stat-label" style={{ textAlign: 'center', padding: '1rem 0' }}>
                  Nenhuma matéria cadastrada.
                </p>
              )}
            </div>
          </div>

          <div className="glass-card">
            <SectionHeader
              icon="history"
              title="Sessões Recentes"
            />
            <div className={styles.timeline}>
              <div className={styles.timelineLine} />
              <div className={styles.timelineItems}>
                {sessions.map((s) => (
                  <TimelineItem
                    key={s.id}
                    icon={getSubjectIcon(s.subject)}
                    label={s.subject}
                    time={timeAgo(s.date)}
                    description={s.notes || `${s.duration}min`}
                    status="completed"
                  />
                ))}
                {sessions.length === 0 && (
                  <p className="stat-label" style={{ textAlign: 'center', padding: '1rem 0' }}>
                    Nenhuma sessão recente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditGoalForm({ goal, onSave, onCancel, onDelete }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
          name: fd.get('name'),
          color: fd.get('color'),
          progress: parseInt(fd.get('progress'), 10),
          weekTarget: parseInt(fd.get('weekTarget'), 10),
        });
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-hover)' }}
    >
      <input name="name" defaultValue={goal.name} required style={inputStyle} autoFocus placeholder="Nome" />
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <input name="color" defaultValue={goal.color} placeholder="Cor hex" style={{ ...inputStyle, flex: 1 }} />
        <input name="progress" type="number" defaultValue={goal.progress} min="0" max="100" placeholder="Progresso %" style={{ ...inputStyle, flex: 1 }} />
        <input name="weekTarget" type="number" defaultValue={goal.weekTarget} min="1" placeholder="Meta semanal" style={{ ...inputStyle, flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--danger)' }} onClick={onDelete}>Excluir</button>
        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>Salvar</button>
      </div>
    </form>
  );
}

const inputStyle = {
  background: 'var(--surface-hover)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '0.5rem 0.625rem',
  color: 'var(--foreground)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
};
