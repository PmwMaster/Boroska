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
      if (!userId) return res.json({ balance: 0, weekExpenses: 0, weekData: [] });
      const { data: incomeData } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME');
      const { data: expenseData } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE');
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: weekExpenses } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', weekAgo);
      const income = (incomeData || []).reduce((s, t) => s + t.amount, 0);
      const expenses = (expenseData || []).reduce((s, t) => s + t.amount, 0);
      const weekExp = (weekExpenses || []).reduce((s, t) => s + t.amount, 0);
      return res.json({ balance: income - expenses, weekExpenses: weekExp, weekData: [] });
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

  res.status(404).json({ error: 'Rota nao encontrada' });
}
