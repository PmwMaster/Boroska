import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action, id } = req.query;

  if (action === 'stats' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ todayMinutes: 0, streak: 0, projectProgress: 0 });
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data: todaySessions } = await supabaseAdmin.from('StudySession').select('duration').eq('userId', userId).gte('date', today.toISOString());
      const todayMinutes = (todaySessions || []).reduce((s, r) => s + (r.duration || 0), 0);
      const { data: goals } = await supabaseAdmin.from('StudyGoal').select('progress').eq('userId', userId).order('progress', { ascending: false }).limit(1);
      return res.json({ todayMinutes, streak: 0, projectProgress: goals?.[0]?.progress || 0 });
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar stats' }); }
  }

  if (action === 'goals' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const { data } = await supabaseAdmin.from('StudyGoal').select('*').eq('userId', userId).order('progress', { ascending: false });
      return res.json(data || []);
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar metas' }); }
  }

  if (action === 'sessions' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const limit = parseInt(req.query.limit) || 5;
      const { data } = await supabaseAdmin.from('StudySession').select('*').eq('userId', userId).order('date', { ascending: false }).limit(limit);
      return res.json(data || []);
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar sessoes' }); }
  }

  if (action === 'create_session' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { subject, duration, topic } = req.body;
      if (!subject?.trim()) return res.status(400).json({ error: 'Campo materia obrigatorio' });
      if (!duration || parseInt(duration) <= 0) return res.status(400).json({ error: 'Campo duracao obrigatorio' });
      if (parseInt(duration) > 1440) return res.status(400).json({ error: 'Duracao maxima: 24 horas' });
      const { data, error } = await supabaseAdmin.from('StudySession').insert({ subject: subject.trim(), topic: topic || '', duration: parseInt(duration), userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar sessao' }); }
  }

  if (action === 'create_goal' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { name, progress, color, weekTarget, weekDone } = req.body;
      if (!name?.trim()) return res.status(400).json({ error: 'Campo nome obrigatorio' });
      if (name.trim().length > 100) return res.status(400).json({ error: 'Nome muito longo (max 100 caracteres)' });
      const { data, error } = await supabaseAdmin.from('StudyGoal').insert({ name: name.trim(), progress: progress || 0, color: color || '#7C6FF0', weekTarget: weekTarget || 24, weekDone: weekDone || 0, userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar meta' }); }
  }

  if (action === 'update_session' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: session } = await supabaseAdmin.from('StudySession').select('userId').eq('id', id).single();
      if (!session) return res.status(404).json({ error: 'Nao encontrada' });
      if (session.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      ['subject', 'topic', 'duration', 'notes'].forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
      const { data, error } = await supabaseAdmin.from('StudySession').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar sessao' }); }
  }

  if (action === 'delete_session' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: session } = await supabaseAdmin.from('StudySession').select('userId').eq('id', id).single();
      if (!session) return res.status(404).json({ error: 'Nao encontrada' });
      if (session.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      await supabaseAdmin.from('StudySession').delete().eq('id', id);
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar sessao' }); }
  }

  if (action === 'update_goal' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: goal } = await supabaseAdmin.from('StudyGoal').select('userId').eq('id', id).single();
      if (!goal) return res.status(404).json({ error: 'Nao encontrada' });
      if (goal.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      ['name', 'progress', 'color', 'weekTarget', 'weekDone'].forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
      const { data, error } = await supabaseAdmin.from('StudyGoal').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar meta' }); }
  }

  if (action === 'delete_goal' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: goal } = await supabaseAdmin.from('StudyGoal').select('userId').eq('id', id).single();
      if (!goal) return res.status(404).json({ error: 'Nao encontrada' });
      if (goal.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      await supabaseAdmin.from('StudyGoal').delete().eq('id', id);
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar meta' }); }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
