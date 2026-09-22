import { useState } from 'react';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import { PageSkeleton } from '../components/ui/Skeleton.jsx';
import { fetchReport } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import styles from './Relatorio.module.css';

const periods = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
];

function formatCurrency(value) {
  return `R$ ${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

export default function Relatorio() {
  const [period, setPeriod] = useState('week');
  const { data, loading, error, reload } = useFetch(() => fetchReport(period), [period]);

  if (loading) return <div className={styles.page}><PageSkeleton /></div>;
  if (error) {
    return (
      <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '1rem' }}>Erro ao carregar: {error}</p>
        <button onClick={reload} className="btn btn-secondary">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
          Tentar novamente
        </button>
      </div>
    );
  }

  const report = data || { tasksDone: 0, studyMinutes: 0, workoutsDone: 0, income: 0, expenses: 0, balance: 0 };
  const days = period === 'week' ? 7 : 30;

  return (
    <div className={styles.page}>
      <TutorialBox
        id="relatorio-intro"
        icon="monitoring"
        title="Relatório"
        steps={[
          'Aqui você vê um resumo do seu progresso na semana ou no mês.',
          'Acompanhe tarefas concluídas, tempo de estudo, treinos e finanças do período.',
        ]}
      />

      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Relatório</h2>
          <p className={styles.subtitle}>Seu progresso nos últimos {days} dias.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {periods.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`chip ${period === p.key ? 'chip-primary' : 'chip-outline'}`}
              style={{ cursor: 'pointer', border: period === p.key ? 'none' : undefined, padding: '0.5rem 1rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.statsGrid}>
        <StatsCard
          icon="task_alt"
          iconBg="var(--success-bg)"
          label="Tarefas concluídas"
          value={String(report.tasksDone)}
        />
        <StatsCard
          icon="timer"
          iconBg="var(--info-bg)"
          label="Tempo de estudo"
          value={`${Math.floor(report.studyMinutes / 60)}h ${report.studyMinutes % 60}m`}
        />
        <StatsCard
          icon="fitness_center"
          iconBg="var(--warning-bg)"
          label="Treinos concluídos"
          value={String(report.workoutsDone)}
        />
        <StatsCard
          icon="account_balance_wallet"
          iconBg={report.balance >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)'}
          label="Saldo do período"
          value={formatCurrency(report.balance)}
        />
      </div>

      <div className="glass-card">
        <SectionHeader icon="payments" title="Financeiro do período" />
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Receitas</span>
          <span className={styles.metricValue} style={{ color: 'var(--success)' }}>+{formatCurrency(report.income)}</span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Despesas</span>
          <span className={styles.metricValue} style={{ color: 'var(--danger)' }}>-{formatCurrency(report.expenses)}</span>
        </div>
        <div className={styles.metricRow}>
          <span className={styles.metricLabel}>Saldo</span>
          <span className={styles.metricValue} style={{ color: report.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {report.balance >= 0 ? '+' : ''}{formatCurrency(report.balance)}
          </span>
        </div>
      </div>
    </div>
  );
}
