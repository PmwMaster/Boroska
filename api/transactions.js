import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action, id } = req.query;

  if (action === 'list' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const limit = parseInt(req.query.limit) || 10;
      const { data, error } = await supabaseAdmin.from('Transaction').select('*').eq('userId', userId).order('date', { ascending: false }).limit(limit);
      if (error) throw error;
      return res.json(data || []);
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar transacoes' }); }
  }

  if (action === 'stats' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ balance: 0, weekExpenses: 0, weekData: [], savings: null });
      const { data: incomeData } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME');
      const { data: expenseData } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE');
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: weekExpenses } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', weekAgo);
      const income = (incomeData || []).reduce((s, t) => s + t.amount, 0);
      const expenses = (expenseData || []).reduce((s, t) => s + t.amount, 0);
      const weekExp = (weekExpenses || []).reduce((s, t) => s + t.amount, 0);

      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const [{ data: goal }, { data: monthIncome }, { data: monthExpense }] = await Promise.all([
        supabaseAdmin.from('FinanceGoal').select('*').eq('userId', userId).order('createdAt').limit(1).maybeSingle(),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME').gte('date', monthStart.toISOString()),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', monthStart.toISOString()),
      ]);
      const savedThisMonth = Math.max(0, (monthIncome || []).reduce((s, t) => s + t.amount, 0) - (monthExpense || []).reduce((s, t) => s + t.amount, 0));
      const savings = goal ? { id: goal.id, name: goal.name, current: savedThisMonth, target: goal.targetAmount } : null;

      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);

      const { data: weekTx } = await supabaseAdmin
        .from('Transaction')
        .select('amount, type, date')
        .eq('userId', userId)
        .gte('date', monday.toISOString());

      const weekData = Array.from({ length: 7 }, (_, i) => {
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const dayTxs = (weekTx || []).filter(t => {
          const td = new Date(t.date);
          return td >= dayStart && td < dayEnd;
        });

        const entradas = dayTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const saidas = dayTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        return { entradas, saidas };
      });

      return res.json({ balance: income - expenses, weekExpenses: weekExp, weekData, savings });
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar stats' }); }
  }

  if (action === 'categories' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const { data } = await supabaseAdmin.from('Transaction').select('category, amount').eq('userId', userId).eq('type', 'EXPENSE');
      const cats = {};
      (data || []).forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
      const meta = { alimentacao: { name: 'Alimentacao', icon: 'restaurant', color: '#c9a74d' }, moradia: { name: 'Moradia', icon: 'home', color: '#60a5fa' }, assinaturas: { name: 'Assinaturas', icon: 'subscriptions', color: '#a78bfa' }, transporte: { name: 'Transporte', icon: 'directions_car', color: '#34d399' }, outros: { name: 'Outros', icon: 'category', color: '#9ca3af' }, salario: { name: 'Salario', icon: 'work', color: '#10b981' }, freelance: { name: 'Freelance', icon: 'laptop', color: '#f59e0b' } };
      return res.json(Object.entries(cats).map(([category, amount]) => ({ category, ...(meta[category] || { name: category, icon: 'category', color: '#9ca3af' }), amount })));
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar categorias' }); }
  }

  if (action === 'create' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const amount = parseFloat(req.body.amount);
      const { description, type, category } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ error: 'Campo valor obrigatorio' });
      if (!description?.trim()) return res.status(400).json({ error: 'Campo descricao obrigatorio' });
      if (description.trim().length > 500) return res.status(400).json({ error: 'Descricao muito longa (max 500 caracteres)' });
      const { data, error } = await supabaseAdmin.from('Transaction').insert({ type: type || 'EXPENSE', category: category || 'outros', amount, description: description.trim(), userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar transacao' }); }
  }

  if (action === 'update' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: tx } = await supabaseAdmin.from('Transaction').select('userId').eq('id', id).single();
      if (!tx) return res.status(404).json({ error: 'Nao encontrada' });
      if (tx.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      ['type', 'category', 'amount', 'description'].forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
      const { data, error } = await supabaseAdmin.from('Transaction').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar transacao' }); }
  }

  if (action === 'delete' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: tx } = await supabaseAdmin.from('Transaction').select('userId').eq('id', id).single();
      if (!tx) return res.status(404).json({ error: 'Nao encontrada' });
      if (tx.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { error } = await supabaseAdmin.from('Transaction').delete().eq('id', id);
      if (error) throw error;
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar transacao' }); }
  }

  if (action === 'goals' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const [{ data: goals }, { data: incomeData }, { data: expenseData }] = await Promise.all([
        supabaseAdmin.from('FinanceGoal').select('*').eq('userId', userId).order('createdAt'),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME').gte('date', monthStart.toISOString()),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', monthStart.toISOString()),
      ]);
      const savedThisMonth = (incomeData || []).reduce((s, t) => s + t.amount, 0) - (expenseData || []).reduce((s, t) => s + t.amount, 0);
      const withProgress = (goals || []).map((g) => ({
        ...g,
        saved: Math.max(0, savedThisMonth),
        progress: g.targetAmount > 0 ? Math.min(100, Math.round((Math.max(0, savedThisMonth) / g.targetAmount) * 100)) : 0,
      }));
      return res.json(withProgress);
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar metas' }); }
  }

  if (action === 'create_goal' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { name, targetAmount, color } = req.body;
      if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatorio' });
      const target = parseFloat(targetAmount);
      if (!target || target <= 0) return res.status(400).json({ error: 'Valor alvo obrigatorio' });
      const { data, error } = await supabaseAdmin.from('FinanceGoal').insert({ name: name.trim(), targetAmount: target, color: color || '#7EB356', userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar meta' }); }
  }

  if (action === 'update_goal' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: goal } = await supabaseAdmin.from('FinanceGoal').select('userId').eq('id', id).single();
      if (!goal) return res.status(404).json({ error: 'Nao encontrada' });
      if (goal.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.targetAmount !== undefined) updates.targetAmount = parseFloat(req.body.targetAmount);
      if (req.body.color !== undefined) updates.color = req.body.color;
      const { data, error } = await supabaseAdmin.from('FinanceGoal').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar meta' }); }
  }

  if (action === 'delete_goal' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: goal } = await supabaseAdmin.from('FinanceGoal').select('userId').eq('id', id).single();
      if (!goal) return res.status(404).json({ error: 'Nao encontrada' });
      if (goal.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { error } = await supabaseAdmin.from('FinanceGoal').delete().eq('id', id);
      if (error) throw error;
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar meta' }); }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
