import { useState } from 'react';
import { StatsCard } from '../components/ui/StatsCard.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { CreateTransactionForm } from '../components/ui/CreateTransactionForm.jsx';
import { fetchFinanceStats, fetchTransactions, fetchCategories, updateTransaction, deleteTransaction } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import styles from './Financas.module.css';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const txCategories = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'salario', label: 'Salário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'outros', label: 'Outros' },
];

const txTypes = [
  { value: 'INCOME', label: 'Entrada' },
  { value: 'EXPENSE', label: 'Saída' },
];

const txCategoryMeta = {
  alimentacao: { icon: 'restaurant', color: 'var(--warning)' },
  moradia: { icon: 'home', color: 'var(--info)' },
  assinaturas: { icon: 'subscriptions', color: 'var(--primary)' },
  transporte: { icon: 'directions_car', color: 'var(--success)' },
  outros: { icon: 'category', color: '#9ca3af' },
  salario: { icon: 'work', color: '#10b981' },
  freelance: { icon: 'laptop', color: '#f59e0b' },
};

const txCategoryBg = {
  alimentacao: 'var(--warning-bg)',
  moradia: 'var(--info-bg)',
  assinaturas: 'rgba(226, 138, 75, 0.1)',
  transporte: 'var(--success-bg)',
  outros: 'var(--surface-bright)',
  salario: 'var(--success-bg)',
  freelance: 'var(--warning-bg)',
};

function formatCurrency(value) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function formatTxDate(date) {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((txDay - today) / (1000 * 60 * 60 * 24));
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === -1) return `Ontem, ${time}`;
  return `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}, ${time}`;
}

export default function Financas() {
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);

  const { data: stats, loading: statsLoading, error: statsError, reload } = useFetch(fetchFinanceStats);
  const { data: transactions, loading: txLoading, error: txError, reload: reloadTx } = useFetch(() => fetchTransactions(5));
  const { data: categories, loading: catLoading, error: catError } = useFetch(fetchCategories);

  const reloadAll = () => { reload(); reloadTx(); };

  const loading = statsLoading || txLoading || catLoading;
  const error = statsError || txError || catError;

  if (loading) {
    return (
      <div className={styles.financas} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1rem' }}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.financas} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '1rem' }}>Erro ao carregar: {error}</p>
        <button onClick={reloadAll} className="btn btn-secondary">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
          Tentar novamente
        </button>
      </div>
    );
  }

  const chartData = stats.weekData.map((d, i) => ({
    day: weekDays[i] || `D${i}`,
    entry: d.entradas,
    exit: d.saidas,
  }));

  const maxVal = Math.max(...chartData.flatMap((d) => [d.entry, d.exit]), 100);
  const yMax = Math.ceil(maxVal / 1000) * 1000;
  const steps = 4;
  const yLabels = Array.from({ length: steps + 1 }, (_, i) => yMax - (yMax / steps) * i);
  const totalEntradas = chartData.reduce((acc, d) => acc + d.entry, 0);
  const totalSaidas = chartData.reduce((acc, d) => acc + d.exit, 0);
  const periodBalance = totalEntradas - totalSaidas;
  const expensePct = totalEntradas > 0 ? Math.round((totalSaidas / totalEntradas) * 100) : 0;
  const savings = stats.savings || { current: 0, target: 1 };
  const savingsPct = savings.target > 0
    ? Math.round((savings.current / savings.target) * 100)
    : 0;

  return (
    <div className={styles.financas}>
      <TutorialBox
        id="financas-intro"
        icon="payments"
        title="Controle Financeiro"
        steps={[
          "Registre suas entradas e saídas para acompanhar suas finanças.",
          "Clique em 'Nova Transação' para registrar um gasto ou receita.",
          "O gráfico mostra o fluxo de caixa das últimas semanas.",
          "Use ✏️ para editar e 🗑️ para excluir transações.",
        ]}
      />

      <header className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Visão Geral</h2>
        <CreateTransactionForm onSuccess={reloadAll} />
      </header>

      <div className={styles.statsGrid}>
        <StatsCard
          icon="account_balance_wallet"
          iconBg="var(--success-bg)"
          label="Saldo Atual"
          value={formatCurrency(stats.balance)}
        />

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div className="stat-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>trending_down</span>
            </div>
          </div>
          <div>
            <p className="stat-label">Gastos da Semana</p>
            <div className={styles.spendRow}>
              <span className={styles.spendValue}>{formatCurrency(totalSaidas)}</span>
            </div>
            <div className={styles.progressLabel}>
              <span className={styles.progressText}>do orçamento semanal</span>
              <span className={styles.progressPct}>{expensePct}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${expensePct}%`, backgroundColor: 'var(--danger)' }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>savings</span>
            </div>
          </div>
          <div>
            <p className="stat-label">Meta de Economia</p>
            <div className={styles.spendRow}>
              <span className={styles.spendValue}>{formatCurrency(savings.current)}</span>
              <span className={styles.savingsPct}>/ {formatCurrency(savings.target)}</span>
            </div>
            <div className={styles.progressLabel}>
              <span className={styles.progressText} style={{ color: 'var(--success)' }}>meta mensal</span>
              <span className={styles.progressPct}>{savingsPct}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${savingsPct}%`, backgroundColor: 'var(--success)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className="glass-card">
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>bar_chart</span>
              Fluxo de Caixa
            </h3>
            <div className={styles.monthSelector}>
              <span className={styles.monthLabel}>
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#22c55e' }} />
              Entradas
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#ef4444' }} />
              Saídas
            </div>
          </div>

          <div className={styles.plotArea}>
            <div className={styles.yAxis}>
              {yLabels.map((v) => {
                const k = v / 1000;
                return (<span key={v} className={styles.yLabel}>R${Number.isInteger(k) ? k : k.toFixed(1).replace('.', ',')}k</span>);
              })}
            </div>
            <div className={styles.barChart}>
              {chartData.map((d) => (
                <div key={d.day} className={styles.barGroup}>
                  <div
                    className={`${styles.bar} ${styles.barEntry}`}
                    style={{ height: `${(d.entry / yMax) * 100}%` }}
                  />
                  <div
                    className={`${styles.bar} ${styles.barExit}`}
                    style={{ height: `${(d.exit / yMax) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.xAxis}>
              {chartData.map((d) => (
                <span key={d.day} className={styles.xLabel}>{d.day}</span>
              ))}
            </div>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Saldo do Período</span>
            <span className={styles.totalValue} style={{ color: periodBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {periodBalance >= 0 ? '+' : ''}{formatCurrency(periodBalance)}
            </span>
          </div>
        </div>

        <div className={styles.sidebarCol}>
          <div className="glass-card">
            <SectionHeader icon="category" title="Categorias" />
            <div className={styles.categoryGrid}>
              {categories.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '1rem' }}>
                  Nenhuma categoria com gastos.
                </p>
              )}
              {categories.map((cat) => (
                <div key={cat.category} className={styles.categoryCard}>
                  <div className={styles.catIconRow}>
                    <div className={styles.catIcon} style={{ backgroundColor: 'rgba(226, 138, 75, 0.1)', color: cat.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{cat.icon}</span>
                    </div>
                    <span className={styles.catName}>{cat.name}</span>
                  </div>
                  <span className={styles.catAmount}>{formatCurrency(cat.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <SectionHeader icon="receipt_long" title="Últimas Transações" />
            <div className={styles.txList}>
              {transactions.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', padding: '1rem' }}>
                  Nenhuma transação registrada ainda.
                </p>
              )}
              {transactions.map((tx) => {
                const meta = txCategoryMeta[tx.category] || { icon: 'category', color: '#9ca3af' };
                const bg = txCategoryBg[tx.category] || 'var(--surface-bright)';
                const isIncome = tx.type === 'INCOME';

                if (editingId === tx.id) {
                  return (
                    <div key={tx.id} className={styles.txItem} style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch', padding: '0.625rem' }}>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          try {
                            await updateTransaction(tx.id, {
                              amount: parseFloat(fd.get('amount')),
                              category: fd.get('category'),
                              description: fd.get('description'),
                              type: fd.get('type'),
                            });
                            toast.success('Transação atualizada!');
                            setEditingId(null);
                            reloadAll();
                          } catch {
                            toast.error('Erro ao atualizar transação');
                          }
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}
                      >
                        <input name="description" defaultValue={tx.description} style={inputStyle} autoFocus />
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <input name="amount" type="number" step="0.01" defaultValue={tx.amount} style={{ ...inputStyle, flex: 1 }} />
                          <select name="type" defaultValue={tx.type} style={{ ...inputStyle, flex: 1 }}>
                            {txTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <select name="category" defaultValue={tx.category} style={{ ...inputStyle, flex: 1 }}>
                            {txCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8125rem', color: 'var(--danger)' }}
                            onClick={async () => {
                              try {
                                await deleteTransaction(tx.id);
                                toast.success('Transação removida!');
                                setEditingId(null);
                                reloadAll();
                              } catch {
                                toast.error('Erro ao remover transação');
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
                  <div key={tx.id} className={styles.txItem}>
                    <div className={styles.txIcon} style={{ backgroundColor: bg, color: meta.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{meta.icon}</span>
                    </div>
                    <div className={styles.txInfo}>
                      <span className={styles.txName}>{tx.description}</span>
                      <span className={styles.txDate}>{formatTxDate(tx.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className={`${styles.txAmount} ${isIncome ? styles.txAmountPositive : styles.txAmountNegative}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingId(tx.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', lineHeight: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit</span>
                      </button>
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
