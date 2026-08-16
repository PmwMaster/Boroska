import { useState } from 'react';
import { fetchRoutineBlocks, fetchRoutineStats, toggleRoutineBlock, updateRoutine, deleteRoutine } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { CreateRoutineForm } from '../components/ui/CreateRoutineForm.jsx';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import styles from './Rotina.module.css';

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const dayOptions = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function Rotina() {
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const { data: blocks, loading: blocksLoading, error: blocksError, reload: reloadBlocks } = useFetch(() => fetchRoutineBlocks(selectedDay), [selectedDay]);
  const { data: stats, loading: statsLoading, error: statsError, reload: reloadStats } = useFetch(fetchRoutineStats);

  const reload = () => { reloadBlocks(); reloadStats(); };

  if (blocksLoading || statsLoading) {
    return (
      <div className={styles.page}>
        <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '4rem 0' }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (blocksError || statsError) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Erro ao carregar: {blocksError || statsError}</p>
          <button onClick={reload} className="btn btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { completed, total, streak } = stats;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const firstPendingIndex = blocks.findIndex((b) => !b.isCompleted);
  const timelineItems = blocks.map((block, i) => {
    let status;
    if (block.isCompleted) {
      status = 'completed';
    } else if (i === firstPendingIndex) {
      status = 'active';
    } else {
      status = 'pending';
    }
    return {
      id: block.id,
      icon: block.icon,
      label: block.title,
      time: `${block.startTime} - ${block.endTime}`,
      description: block.description,
      status,
      isCompleted: block.isCompleted,
      dayOfWeek: block.dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
    };
  });

  const activeBlock = blocks.find((b) => !b.isCompleted) || null;

  const todayDOW = new Date().getDay();
  const today = new Date();
  const diff = selectedDay - todayDOW;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  const dateLabel = selectedDay === todayDOW ? 'Hoje' : dayNames[selectedDay];
  const dateFull = targetDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  const handleToggle = async (id) => {
    try {
      await toggleRoutineBlock(id);
      toast.success('Bloco atualizado!');
      reload();
    } catch {
      toast.error('Erro ao atualizar bloco');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoutine(id);
      toast.success('Bloco removido!');
      reload();
    } catch {
      toast.error('Erro ao remover bloco');
    }
  };

  return (
    <div className={styles.page}>
      <TutorialBox
        id="rotina-intro"
        icon="sync"
        title="Sua Rotina Diária"
        steps={[
          "Organize seus blocos de tempo ao longo do dia.",
          "Clique em '+ Bloco' para adicionar um novo horário à sua rotina.",
          "Marque os blocos como concluídos conforme avança no dia.",
          "Use os ícones ✏️ e 🗑️ em cada bloco para editar ou remover.",
        ]}
      />

      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Rotina Diária</h2>
          <p className={styles.subtitle}>
            Siga seu plano e construa consistência todos os dias.
          </p>
        </div>
        <div className={styles.datePicker}>
          <button
            className={styles.chevronBtn}
            onClick={() => setSelectedDay((d) => (d - 1 + 7) % 7)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className={styles.dateInfo}>
            <span className={styles.dateLabel}>{dateLabel}</span>
            <span className={styles.dateFull}>{dateFull}</span>
          </div>
          <button
            className={styles.chevronBtn}
            onClick={() => setSelectedDay((d) => (d + 1) % 7)}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <StatsCard
          icon="checklist"
          iconBg="var(--success-bg)"
          label="Blocos Concluídos"
          value={`${completed}/${total}`}
          chip={{ text: `${percent}% do dia`, variant: 'default' }}
        />
        <div className="glass-card">
          <div className={styles.statRow}>
            <div
              className="stat-icon"
              style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}
            >
              <span className="material-symbols-outlined">play_circle</span>
            </div>
          </div>
          <div>
            <p className="stat-label">Em Andamento</p>
            <div className={styles.statActiveRow}>
              <span className={styles.statActiveText}>
                {activeBlock ? activeBlock.title : 'Nenhum'}
              </span>
              {activeBlock && (
                <span className={`chip chip-warning ${styles.pulseChip}`}>Agora</span>
              )}
            </div>
          </div>
        </div>
        <StatsCard
          icon="local_fire_department"
          iconBg="rgba(226, 138, 75, 0.12)"
          label="Streak de Rotina"
          value={streak}
          chip={{ text: 'Dias', variant: 'tertiary' }}
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.timelineSection}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeader icon="timeline" title="Linha do Tempo" />
              <CreateRoutineForm onSuccess={reload} />
            </div>

            <div className={styles.timelineBar}>
              {[6, 8, 10, 12, 14, 16, 18, 20, 22].map((hour) => (
                <div key={hour} className={styles.timeSlot}>
                  <span className={styles.timeLabel}>
                    {String(hour).padStart(2, '0')}:00
                  </span>
                  <span className={styles.timeMarker} />
                </div>
              ))}
            </div>

            {timelineItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '2rem' }}>
                Nenhum bloco cadastrado para hoje.
              </p>
            ) : (
              <div className={styles.timelineItems}>
                {timelineItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`${styles.timelineItem} ${styles[`timelineItem--${item.status}`]}`}
                  >
                    <div className={styles.timelineDotCol}>
                      <div
                        className={`timeline-dot ${item.status === 'active' ? styles.dotActive : ''}`}
                        style={{
                          backgroundColor:
                            item.status === 'completed'
                              ? 'var(--success-bg)'
                              : item.status === 'active'
                                ? 'var(--surface-bright)'
                                : 'var(--surface-bright)',
                          color:
                            item.status === 'completed'
                              ? 'var(--success)'
                              : item.status === 'active'
                                ? 'var(--warning)'
                                : 'var(--foreground-muted)',
                          boxShadow:
                            item.status === 'active'
                              ? '0 0 16px rgba(226, 138, 75, 0.35)'
                              : undefined,
                        }}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      {i < timelineItems.length - 1 && (
                        <div
                          className={styles.dotConnector}
                          style={{
                            backgroundColor:
                              item.status === 'completed' ? 'var(--success)' : 'var(--border)',
                          }}
                        />
                      )}
                    </div>

                    <div
                      className={`${styles.timelineContent} ${item.status === 'active' ? styles.timelineContentActive : ''} ${item.status === 'completed' ? styles.timelineContentCompleted : ''}`}
                    >
                      {editingId === item.id ? (
                        <EditRoutineForm
                          item={item}
                          onSave={async (data) => {
                            try {
                              await updateRoutine(item.id, data);
                              toast.success('Bloco atualizado!');
                              setEditingId(null);
                              reload();
                            } catch {
                              toast.error('Erro ao atualizar bloco');
                            }
                          }}
                          onCancel={() => setEditingId(null)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ) : (
                        <>
                          <div className={styles.timelineHeader}>
                            <span
                              className={`${styles.timelineLabel} ${item.status === 'active' ? styles.timelineLabelActive : ''}`}
                            >
                              {item.label}
                            </span>
                            <div className={styles.timelineHeaderRight}>
                              <span className={styles.timelineTime}>{item.time}</span>
                              <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setEditingId(item.id)}
                                title="Editar"
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{
                                    fontSize: '1.25rem',
                                    color: 'var(--foreground-muted)',
                                  }}
                                >
                                  edit
                                </span>
                              </button>
                              <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => handleToggle(item.id)}
                                title={item.isCompleted ? 'Desmarcar' : 'Concluir'}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{
                                    fontSize: '1.5rem',
                                    color: item.isCompleted ? 'var(--success)' : 'var(--foreground-muted)',
                                  }}
                                >
                                  {item.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                              </button>
                            </div>
                          </div>
                          {item.description && (
                            <p className={styles.timelineDesc}>{item.description}</p>
                          )}
                          {item.status === 'active' && (
                            <div style={{ marginTop: '0.625rem' }}>
                              <ProgressBar
                                label="Progresso do bloco"
                                percent={(() => {
                                  const now2 = new Date();
                                  const [sh, sm] = item.startTime.split(':').map(Number);
                                  const [eh, em] = item.endTime.split(':').map(Number);
                                  const startMin = sh * 60 + sm;
                                  const endMin = eh * 60 + em;
                                  const nowMin = now2.getHours() * 60 + now2.getMinutes();
                                  return Math.min(100, Math.max(0, ((nowMin - startMin) / (endMin - startMin)) * 100));
                                })()}
                                color="var(--warning)"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}

function EditRoutineForm({ item, onSave, onCancel, onDelete }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = {
          title: fd.get('title'),
          dayOfWeek: parseInt(fd.get('dayOfWeek'), 10),
          startTime: fd.get('startTime'),
          endTime: fd.get('endTime'),
          description: fd.get('description') || null,
          icon: fd.get('icon') || null,
        };
        onSave(data);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      <input name="title" defaultValue={item.label} required style={inputStyle} autoFocus />
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <select name="dayOfWeek" defaultValue={item.dayOfWeek} style={inputStyle}>
          {dayOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <input name="startTime" defaultValue={item.startTime} placeholder="Início" required style={inputStyle} />
        <input name="endTime" defaultValue={item.endTime} placeholder="Fim" required style={inputStyle} />
      </div>
      <input name="description" defaultValue={item.description || ''} placeholder="Descrição" style={inputStyle} />
      <input name="icon" defaultValue={item.icon} placeholder="Ícone" style={inputStyle} />
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
