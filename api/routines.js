import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action, id } = req.query;

  if (action === 'list' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const day = parseInt(req.query.day) || new Date().getDay();
      const { data, error } = await supabaseAdmin.from('RoutineBlock').select('*').eq('userId', userId).eq('dayOfWeek', day).order('startTime');
      if (error) throw error;
      return res.json(data || []);
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar rotina' }); }
  }

  if (action === 'stats' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ completed: 0, total: 0, streak: 0 });
      const day = new Date().getDay();
      const { count: total } = await supabaseAdmin.from('RoutineBlock').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('dayOfWeek', day);
      const { count: completed } = await supabaseAdmin.from('RoutineBlock').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('dayOfWeek', day).eq('isCompleted', true);
      return res.json({ completed: completed || 0, total: total || 0, streak: 0 });
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar stats' }); }
  }

  if (action === 'create' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { title, dayOfWeek, startTime, endTime } = req.body;
      if (!title?.trim()) return res.status(400).json({ error: 'Campo titulo obrigatorio' });
      if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) return res.status(400).json({ error: 'Campo dia da semana obrigatorio' });
      if (!startTime || !endTime) return res.status(400).json({ error: 'Campo horario obrigatorio' });
      const { data, error } = await supabaseAdmin.from('RoutineBlock').insert({ title: title.trim(), dayOfWeek, startTime, endTime, userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar bloco' }); }
  }

  if (action === 'toggle' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: block } = await supabaseAdmin.from('RoutineBlock').select('isCompleted, userId').eq('id', id).single();
      if (!block) return res.status(404).json({ error: 'Nao encontrado' });
      if (block.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { data, error } = await supabaseAdmin.from('RoutineBlock').update({ isCompleted: !block.isCompleted }).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao alternar bloco' }); }
  }

  if (action === 'update' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: block } = await supabaseAdmin.from('RoutineBlock').select('userId').eq('id', id).single();
      if (!block) return res.status(404).json({ error: 'Nao encontrado' });
      if (block.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      ['title', 'description', 'startTime', 'endTime', 'icon', 'dayOfWeek'].forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
      const { data, error } = await supabaseAdmin.from('RoutineBlock').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar bloco' }); }
  }

  if (action === 'delete' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: block } = await supabaseAdmin.from('RoutineBlock').select('userId').eq('id', id).single();
      if (!block) return res.status(404).json({ error: 'Nao encontrado' });
      if (block.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { error } = await supabaseAdmin.from('RoutineBlock').delete().eq('id', id);
      if (error) throw error;
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar bloco' }); }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
