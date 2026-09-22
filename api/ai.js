import { supabaseAdmin, getUserId } from './lib/auth.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGemini(systemInstruction, contents) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY nao configurada');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('').trim();
}

async function buildContext(userId) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { data: tasks },
    { data: routines },
    { data: incomeData },
    { data: expenseData },
    { data: weekExpenseData },
    { data: lastWorkout },
    { data: studyGoals },
    { data: studyToday },
  ] = await Promise.all([
    supabaseAdmin.from('Task').select('title, category, priority, status').eq('userId', userId).neq('status', 'DONE').limit(10),
    supabaseAdmin.from('RoutineBlock').select('title, isCompleted').eq('userId', userId).eq('dayOfWeek', new Date().getDay()),
    supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME'),
    supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE'),
    supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', weekAgo),
    supabaseAdmin.from('Workout').select('*, WorkoutExercise(*)').eq('userId', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('StudyGoal').select('name, progress').eq('userId', userId),
    supabaseAdmin.from('StudySession').select('duration').eq('userId', userId).gte('date', today.toISOString()),
  ]);

  const pendingTasks = tasks || [];
  const highPriority = pendingTasks.filter(t => t.priority === 'HIGH');
  const completedBlocks = (routines || []).filter(b => b.isCompleted);
  const income = (incomeData || []).reduce((s, t) => s + t.amount, 0);
  const expenses = (expenseData || []).reduce((s, t) => s + t.amount, 0);
  const weekExpenses = (weekExpenseData || []).reduce((s, t) => s + t.amount, 0);
  const studyTodayMinutes = (studyToday || []).reduce((s, t) => s + (t.duration || 0), 0);

  return `Dados atuais do usuario (hoje):
- ${pendingTasks.length} tarefas pendentes (${highPriority.length} alta prioridade): ${pendingTasks.map(t => t.title).join(', ') || 'nenhuma'}
- Rotina: ${(routines || []).length} blocos, ${completedBlocks.length} concluidos
- Financas: saldo R$${(income - expenses).toFixed(2)}, gastos da semana R$${weekExpenses.toFixed(2)}
- Treino: ${lastWorkout ? `${lastWorkout.muscleGroup} (${(lastWorkout.WorkoutExercise || []).length} exercicios, status: ${lastWorkout.status})` : 'nenhum treino recente'}
- Estudos: ${studyTodayMinutes}min hoje, ${(studyGoals || []).length} metas: ${(studyGoals || []).map(g => `${g.name} ${g.progress}%`).join(', ') || 'nenhuma'}`;
}

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
      const { message, sessionId } = req.body;
      if (!message) return res.status(400).json({ error: 'Mensagem obrigatoria' });
      if (message.length > 5000) return res.status(400).json({ error: 'Mensagem muito longa (max 5000 caracteres)' });

      const context = await buildContext(userId);
      const systemInstruction = `Voce e o assistente do Boroska, um app de produtividade pessoal. Responda em portugues, de forma direta e util. Use os dados atuais abaixo para dar conselhos personalizados. Use o historico da conversa para manter contexto entre mensagens.

${context}

Quando sugerir uma acao concreta, use este formato exato no final da resposta, em uma linha propria:
[ACTION:criar_tarefa]Titulo da tarefa|Categoria|Prioridade(HIGH/MEDIUM/LOW)
[ACTION:criar_bloco]Titulo|dia_semana(0-6)|HH:MM-HH:MM
[ACTION:criar_meta]Nome da meta|cor_hex|horas_semana
[ACTION:concluir_tarefa]Titulo exato da tarefa existente
[ACTION:registrar_transacao]Descricao|Valor|Tipo(INCOME/EXPENSE)|Categoria`;

      let history = [];
      if (sessionId) {
        const { data: session } = await supabaseAdmin.from('ChatSession').select('userId').eq('id', sessionId).single();
        if (session && session.userId === userId) {
          // O front-end ja salva a mensagem atual do usuario antes de chamar essa rota,
          // entao a linha mais recente e um duplicado da mensagem atual - descarta ela.
          const { data: pastMessages } = await supabaseAdmin
            .from('ChatMessage')
            .select('role, text')
            .eq('sessionId', sessionId)
            .neq('role', 'system')
            .order('createdAt', { ascending: false })
            .limit(11);
          history = (pastMessages || [])
            .slice(1)
            .reverse()
            .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));
        }
      }

      const contents = [...history, { role: 'user', parts: [{ text: message }] }];
      const reply = await callGemini(systemInstruction, contents);

      const actions = [];
      const actionRegex = /\[ACTION:(\w+)\](.+)/g;
      let match;
      while ((match = actionRegex.exec(reply)) !== null) {
        actions.push({ type: match[1], data: match[2].trim() });
      }
      const cleanReply = reply.replace(/\[ACTION:\w+\].+/g, '').trim();

      return res.json({ reply: cleanReply || 'Sem resposta da IA.', actions });
    } catch (e) {
      console.error('Erro IA:', e.message);
      return res.status(503).json({ error: 'IA indisponivel' });
    }
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
      } else if (type === 'concluir_tarefa') {
        const title = data.trim();
        if (!title) return res.status(400).json({ error: 'Titulo obrigatorio' });
        const { data: task } = await supabaseAdmin.from('Task').select('id, status').eq('userId', userId).ilike('title', title).neq('status', 'DONE').limit(1).maybeSingle();
        if (!task) return res.status(404).json({ error: 'Tarefa nao encontrada' });
        const { data: d } = await supabaseAdmin.from('Task').update({ status: 'DONE', completedAt: new Date().toISOString() }).eq('id', task.id).select().single();
        result = d;
      } else if (type === 'registrar_transacao') {
        const [description, amountStr, txType = 'EXPENSE', category = 'outros'] = data.split('|').map(s => s.trim());
        const amount = parseFloat((amountStr || '').replace(',', '.'));
        if (!description || !amount) return res.status(400).json({ error: 'Descricao e valor obrigatorios' });
        const { data: d } = await supabaseAdmin.from('Transaction').insert({
          description, amount: Math.abs(amount),
          type: txType === 'INCOME' ? 'INCOME' : 'EXPENSE',
          category, userId,
        }).select().single();
        result = d;
      } else {
        return res.status(400).json({ error: 'Tipo de acao desconhecido' });
      }
      return res.json({ success: true, result });
    } catch (e) { return res.status(500).json({ error: 'Erro ao executar acao' }); }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
