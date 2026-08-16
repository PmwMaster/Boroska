import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action, id } = req.query;

  if (action === 'list' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      let query = supabaseAdmin.from('Task').select('*').eq('userId', userId);
      const filter = req.query.filter || 'all';
      if (req.query.category) query = query.eq('category', req.query.category);
      if (filter === 'today') {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        query = query.gte('dueDate', today.toISOString()).lt('dueDate', tomorrow.toISOString());
      } else if (filter === 'overdue') {
        query = query.lt('dueDate', new Date().toISOString()).neq('status', 'DONE');
      } else if (filter === 'done') {
        query = query.eq('status', 'DONE');
      }
      const { data, error } = await query.order('status').order('dueDate');
      if (error) throw error;
      return res.json(data || []);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao carregar tarefas' });
    }
  }

  if (action === 'stats' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ pending: 0, highPriority: 0, doneThisWeek: 0 });
      const { count: pending } = await supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).neq('status', 'DONE');
      const { count: highPriority } = await supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('priority', 'HIGH').neq('status', 'DONE');
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count: doneThisWeek } = await supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('status', 'DONE').gte('completedAt', weekAgo);
      return res.json({ pending: pending || 0, highPriority: highPriority || 0, doneThisWeek: doneThisWeek || 0 });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao carregar stats' });
    }
  }

  if (action === 'categories' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const { data } = await supabaseAdmin.from('Task').select('category').eq('userId', userId).neq('status', 'DONE');
      const counts = {};
      (data || []).forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
      return res.json(Object.entries(counts).map(([category, count]) => ({ category, count })));
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao carregar categorias' });
    }
  }

  if (action === 'create' && req.method === 'POST') {
    try {
      const { title, category, priority } = req.body;
      if (!title?.trim()) return res.status(400).json({ error: 'Campo titulo obrigatorio' });
      if (title.trim().length > 200) return res.status(400).json({ error: 'Titulo muito longo (max 200 caracteres)' });
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data, error } = await supabaseAdmin.from('Task').insert({ title: title.trim(), category: category || 'Geral', priority: priority || 'MEDIUM', userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
  }

  if (action === 'toggle' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: task } = await supabaseAdmin.from('Task').select('status, userId').eq('id', id).single();
      if (!task) return res.status(404).json({ error: 'Nao encontrada' });
      if (task.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const completed = task.status !== 'DONE';
      const { data, error } = await supabaseAdmin.from('Task').update({ status: completed ? 'DONE' : 'TODO', completedAt: completed ? new Date().toISOString() : null }).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao alternar tarefa' });
    }
  }

  if (action === 'update' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: task } = await supabaseAdmin.from('Task').select('userId').eq('id', id).single();
      if (!task) return res.status(404).json({ error: 'Nao encontrada' });
      if (task.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.priority !== undefined) updates.priority = req.body.priority;
      if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;
      if (req.body.status !== undefined) updates.status = req.body.status;
      const { data, error } = await supabaseAdmin.from('Task').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
  }

  if (action === 'delete' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: task } = await supabaseAdmin.from('Task').select('userId').eq('id', id).single();
      if (!task) return res.status(404).json({ error: 'Nao encontrada' });
      if (task.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { error } = await supabaseAdmin.from('Task').delete().eq('id', id);
      if (error) throw error;
      return res.json({ deleted: true });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
