import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action, id } = req.query;

  if (action === 'sessions' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json([]);
      const { data } = await supabaseAdmin.from('ChatSession').select('id, title, updatedAt').eq('userId', userId).order('updatedAt', { ascending: false });
      return res.json(data || []);
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar sessoes' }); }
  }

  if (action === 'session' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: session } = await supabaseAdmin.from('ChatSession').select('*').eq('id', id).single();
      if (!session) return res.status(404).json({ error: 'Sessao nao encontrada' });
      if (session.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { data: messages } = await supabaseAdmin.from('ChatMessage').select('*').eq('sessionId', id).order('createdAt');
      return res.json({ ...session, messages: messages || [] });
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar sessao' }); }
  }

  if (action === 'create_session' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { title } = req.body;
      const { data, error } = await supabaseAdmin.from('ChatSession').insert({ title: title || 'Nova conversa', userId }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar sessao' }); }
  }

  if (action === 'add_message' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { role, text } = req.body;
      if (!role || !text) return res.status(400).json({ error: 'role e text obrigatorios' });
      if (!['user', 'assistant', 'system'].includes(role)) return res.status(400).json({ error: 'role invalido' });
      if (text.length > 10000) return res.status(400).json({ error: 'Texto muito longo (max 10000 caracteres)' });
      const { data: session } = await supabaseAdmin.from('ChatSession').select('userId').eq('id', id).single();
      if (!session) return res.status(404).json({ error: 'Sessao nao encontrada' });
      if (session.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      await supabaseAdmin.from('ChatMessage').insert({ role, text, sessionId: id });
      await supabaseAdmin.from('ChatSession').update({ updatedAt: new Date().toISOString() }).eq('id', id);
      return res.json({ ok: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao salvar mensagem' }); }
  }

  if (action === 'delete_session' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: session } = await supabaseAdmin.from('ChatSession').select('userId').eq('id', id).single();
      if (!session) return res.status(404).json({ error: 'Sessao nao encontrada' });
      if (session.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      await supabaseAdmin.from('ChatMessage').delete().eq('sessionId', id);
      await supabaseAdmin.from('ChatSession').delete().eq('id', id);
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar sessao' }); }
  }

  if (action === 'chat' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'Mensagem obrigatoria' });
      if (message.length > 5000) return res.status(400).json({ error: 'Mensagem muito longa (max 5000 caracteres)' });
      return res.json({ reply: 'IA indisponivel no ambiente de producao.', actions: [] });
    } catch (e) { return res.status(503).json({ error: 'IA indisponivel' }); }
  }

  if (action === 'execute' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { type, data } = req.body;
      if (!type || !data) return res.status(400).json({ error: 'type e data obrigatorios' });
      let result;
      if (type === 'criar_tarefa') {
        const [title, category = 'Geral', priority = 'MEDIUM'] = data.split('|').map(s => s.trim());
        if (!title) return res.status(400).json({ error: 'Titulo obrigatorio' });
        const { data: d } = await supabaseAdmin.from('Task').insert({ title, category, priority, userId }).select().single();
        result = d;
      } else if (type === 'criar_bloco') {
        const [title, dayStr = '0', timeStr = '08:00-09:00'] = data.split('|').map(s => s.trim());
        if (!title) return res.status(400).json({ error: 'Titulo obrigatorio' });
        const dayOfWeek = parseInt(dayStr) || new Date().getDay();
        const [startTime = '08:00', endTime = '09:00'] = timeStr.split('-');
        const { data: d } = await supabaseAdmin.from('RoutineBlock').insert({ title, dayOfWeek, startTime, endTime, userId }).select().single();
        result = d;
      } else if (type === 'criar_meta') {
        const [name, color = '#7C6FF0', weekTarget = '4'] = data.split('|').map(s => s.trim());
        if (!name) return res.status(400).json({ error: 'Nome obrigatorio' });
        const { data: d } = await supabaseAdmin.from('StudyGoal').insert({ name, color, weekTarget: parseInt(weekTarget) || 4, userId }).select().single();
        result = d;
      } else {
        return res.status(400).json({ error: 'Tipo de acao desconhecido' });
      }
      return res.json({ success: true, result });
    } catch (e) { return res.status(500).json({ error: 'Erro ao executar acao' }); }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
