import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { CreateTaskForm } from '../components/ui/CreateTaskForm.jsx';
import { fetchTasks, fetchTaskStats, toggleTask, updateTask, deleteTask } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import styles from './Tarefas.module.css';

const categories = [
  { name: 'Trabalho', color: 'var(--primary)', icon: 'work' },
  { name: 'Estudos', color: 'var(--info)', icon: 'school' },
  { name: 'Pessoal', color: 'var(--tertiary)', icon: 'person' },
];

const taskCategories = ['Trabalho', 'Estudos', 'Pessoal', 'Finanças', 'Casa', 'Hábito', 'Geral'];
const priorities = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW', label: 'Baixa' },
];

const filters = [
  { label: 'Todas', key: 'all' },
  { label: 'Hoje', key: 'today' },
  { label: 'Atrasadas', key: 'overdue' },
  { label: 'Concluídas', key: 'done' },
];

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const priorityMap = {
  HIGH: { text: 'Alta', variant: 'error' },
  MEDIUM: { text: 'Média', variant: 'primary' },
  LOW: { text: 'Baixa', variant: 'default' },
};

function formatTaskDate(dueDate) {
  if (!dueDate) return '';
  const d = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((taskDay - today) / (1000 * 60 * 60 * 24));
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Hoje - ${time}`;
  if (diffDays === -1) return `Ontem - ${time}`;
  if (diffDays === 1) return `Amanhã - ${time}`;
  return `${dayNames[d.getDay()]} ${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')} - ${time}`;
}

export default function Tarefas() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get('filtro') || 'all');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const filter = searchParams.get('filtro');
    if (filter) setActiveFilter(filter);
  }, [searchParams]);

  const { data: tasks, loading, error, reload } = useFetch(() => fetchTasks(activeFilter), [activeFilter]);
  const { data: stats } = useFetch(fetchTaskStats, []);

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
  if (!tasks || !stats) return null;

  const overdueCount =
    activeFilter === 'all'
      ? tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length
      : 0;

  return (
    <div className={styles.page}>
      <TutorialBox
        id="tarefas-intro"
        icon="task_alt"
        title="Gerenciador de Tarefas"
        steps={[
          "Aqui você cria e organiza suas tarefas do dia a dia.",
          "Clique em 'Nova tarefa' para adicionar uma tarefa com título, categoria e prioridade.",
          "Marque o checkbox para concluir uma tarefa.",
          "Use o ícone ✏️ para editar e 🗑️ para excluir.",
          "Os filtros acima ajudam a ver tarefas de hoje, atrasadas ou concluídas.",
        ]}
      />

      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Minhas Tarefas</h2>
          <p className={styles.subtitle}>
            Gerencie suas tarefas e mantenha o foco no que realmente importa.
          </p>
        </div>
        <CreateTaskForm onSuccess={reload} />
      </header>

      <div className={styles.statsGrid}>
        <StatsCard
          icon="pending_actions"
          iconBg="var(--warning-bg)"
          label="Pendentes"
          value={String(stats.pending)}
          chip={{
            text: `${overdueCount} atrasadas`,
            variant: 'error',
          }}
        />
        <StatsCard
          icon="priority_high"
          iconBg="var(--danger-bg)"
          label="Alta Prioridade"
          value={String(stats.highPriority)}
        />
        <StatsCard
          icon="check_circle"
          iconBg="var(--success-bg)"
          label="Concluídas na Semana"
          value={String(stats.doneThisWeek)}
        />
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebar}>
          <div className={`glass-card ${styles.sidebarCard}`}>
            <h3 className={styles.sidebarTitle}>Categorias</h3>
            <div className={styles.categoryList}>
              <button
                className={`${styles.categoryItem} ${styles.categoryItemActive}`}
                type="button"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1.125rem', color: 'var(--foreground-muted)' }}
                >
                  category
                </span>
                <span className={styles.categoryName}>Todas</span>
                <span className={styles.categoryCount}>{tasks.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={styles.categoryItem}
                  type="button"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: cat.color }}>
                    {cat.icon}
                  </span>
                  <span className={styles.categoryName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.mainPanel}>
          <div className="glass-card">
            <SectionHeader
              icon="task_alt"
              title="Lista de Tarefas"
            />

            <div className={styles.filterBar}>
              {filters.map((f) => {
                const isActive = activeFilter === f.key;
                const showBadge = f.key === 'overdue' && overdueCount > 0;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setActiveFilter(f.key);
                      if (f.key === 'all') {
                        setSearchParams({});
                      } else {
                        setSearchParams({ filtro: f.key });
                      }
                    }}
                    className={`chip ${isActive ? 'chip-primary' : 'chip-outline'} ${styles.filterChip}`}
                  >
                    {f.label}
                    {showBadge && <span className={styles.filterBadge}>{overdueCount}</span>}
                  </button>
                );
              })}
            </div>

            <div className={styles.taskList}>
              {tasks.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '2rem' }}>
                  Nenhuma tarefa encontrada neste filtro.
                </p>
              )}
              {tasks.map((task) => {
                const priority = priorityMap[task.priority] || { text: task.priority, variant: 'default' };
                const isDone = task.status === 'DONE';
                const isOverdue =
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                if (editingId === task.id) {
                  return (
                    <div
                      key={task.id}
                      className={`list-item ${styles.taskItem}`}
                      style={{
                        borderLeftColor: isOverdue ? 'var(--danger)' : 'transparent',
                      }}
                    >
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          try {
                            await updateTask(task.id, {
                              title: fd.get('title'),
                              category: fd.get('category'),
                              priority: fd.get('priority'),
                            });
                            toast.success('Tarefa atualizada!');
                            setEditingId(null);
                            reload();
                          } catch {
                            toast.error('Erro ao atualizar tarefa');
                          }
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', padding: '0.5rem' }}
                      >
                        <input name="title" defaultValue={task.title} required style={inputStyle} autoFocus />
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <select name="category" defaultValue={task.category} style={{ ...inputStyle, flex: 1 }}>
                            {taskCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select name="priority" defaultValue={task.priority} style={{ ...inputStyle, flex: 1 }}>
                            {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8125rem', color: 'var(--danger)' }}
                            onClick={async () => {
                              try {
                                await deleteTask(task.id);
                                toast.success('Tarefa removida!');
                                setEditingId(null);
                                reload();
                              } catch {
                                toast.error('Erro ao remover tarefa');
                              }
                            }}
                          >
                            Excluir
                          </button>
                          <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => setEditingId(null)}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>
                            Salvar
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    className={`list-item ${styles.taskItem}`}
                    style={{
                      borderLeftColor: isOverdue ? 'var(--danger)' : 'transparent',
                    }}
                  >
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await toggleTask(task.id);
                          toast.success('Tarefa atualizada!');
                          reload();
                        } catch {
                          toast.error('Erro ao atualizar tarefa');
                        }
                      }}
                    >
                      <button
                        type="submit"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          lineHeight: 0,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '1.25rem',
                            color: isDone ? 'var(--primary-start)' : 'var(--foreground-muted)',
                          }}
                        >
                          {isDone ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </button>
                    </form>
                    <div className={styles.taskContent}>
                      <div className={styles.taskInfo}>
                        <span
                          className={styles.taskTitle}
                          style={isDone ? { textDecoration: 'line-through', opacity: 0.6 } : {}}
                        >
                          {task.title}
                        </span>
                        <div className={styles.taskBadges}>
                          <Chip variant={priority.variant}>{priority.text}</Chip>
                          <Chip variant="primary">{task.category}</Chip>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={styles.taskDate}>
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                            schedule
                          </span>
                          {formatTaskDate(task.dueDate)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(task.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', lineHeight: 0 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
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
