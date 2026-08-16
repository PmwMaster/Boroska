const express = require('express');
const { getUserId } = require('../utils');
const { prisma } = require('../prisma');
const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function callOllama(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt,
      stream: false,
      options: { temperature: 0.7, num_predict: 200 },
    }),
  });
  if (!res.ok) throw new Error('Ollama indisponível');
  const data = await res.json();
  return data.response;
}

async function buildContext() {
  const userId = await getUserId();
  if (!userId) return 'Nenhum usuário encontrado.';

  const [tasks, routines, finance, workout, studies] = await Promise.all([
    prisma.task.findMany({ where: { userId, status: { not: 'DONE' } }, take: 10 }),
    prisma.routineBlock.findMany({ where: { userId, dayOfWeek: new Date().getDay() } }),
    (async () => {
      const income = await prisma.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } });
      const expenses = await prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } });
      const weekExp = await prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: new Date(Date.now() - 7 * 86400000) } }, _sum: { amount: true } });
      return { balance: (income._sum.amount ?? 0) - (expenses._sum.amount ?? 0), weekExpenses: weekExp._sum.amount ?? 0 };
    })(),
    prisma.workout.findFirst({ where: { userId }, orderBy: { date: 'desc' }, include: { exercises: true } }),
    (async () => {
      const goals = await prisma.studyGoal.findMany({ where: { userId } });
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayMin = await prisma.studySession.aggregate({ where: { userId, date: { gte: today } }, _sum: { duration: true } });
      return { goals, todayMinutes: todayMin._sum.duration ?? 0 };
    })(),
  ]);

  const pendingTasks = tasks.filter(t => t.status !== 'DONE');
  const highPriority = pendingTasks.filter(t => t.priority === 'HIGH');
  const completedBlocks = routines.filter(b => b.isCompleted);

  return `Dados do Cristiano (hoje):
- ${pendingTasks.length} tarefas pendentes (${highPriority.length} alta prioridade): ${pendingTasks.map(t => t.title).join(', ')}
- Rotina: ${routines.length} blocos, ${completedBlocks.length} concluídos
- Finanças: saldo R$${finance.balance.toFixed(2)}, gastos da semana R$${finance.weekExpenses.toFixed(2)}
- Treino: ${workout ? `${workout.muscleGroup} (${workout.exercises.length} exercícios, status: ${workout.status})` : 'nenhum treino hoje'}
- Estudos: ${studies.todayMinutes}min hoje, ${studies.goals.length} metas: ${studies.goals.map(g => `${g.name} ${g.progress}%`).join(', ')}`;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });

    const context = await buildContext();

    const systemPrompt = `Você é o assistente do Boroska, um app de produtividade pessoal. Seu usuário é Cristiano.
Responda em português, de forma direta e útil. Use os dados atuais abaixo para dar conselhos personalizados.

${context}

Quando você sugerir uma ação concreta (criar tarefa, bloco, transação), use este formato exato no final da resposta:
[ACTION:criar_tarefa]Título da tarefa|Categoria|Prioridade(HIGH/MEDIUM/LOW)
[ACTION:criar_bloco]Título|dia_semana(0-6)|HH:MM-HH:MM
[ACTION:criar_meta]Nome da meta|cor_hex|horas_semana

Responda agora à mensagem do usuário.`;

    const fullPrompt = `${systemPrompt}\n\nUsuário: ${message}\n\nAssistente:`;
    const reply = await callOllama(fullPrompt);

    const actions = [];
    const actionRegex = /\[ACTION:(\w+)\](.+)/g;
    let match;
    while ((match = actionRegex.exec(reply)) !== null) {
      actions.push({ type: match[1], data: match[2].trim() });
    }

    const cleanReply = reply.replace(/\[ACTION:\w+\].+/g, '').trim();

    res.json({ reply: cleanReply, actions });
  } catch (e) {
    console.error('Erro IA:', e.message);
    res.status(503).json({ error: 'IA indisponível. Verifique se o Ollama está rodando.' });
  }
});

router.post('/action', async (req, res) => {
  try {
    const { type, data } = req.body;
    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });

    let result;

    switch (type) {
      case 'criar_tarefa': {
        const [title, category = 'Geral', priority = 'MEDIUM'] = data.split('|').map(s => s.trim());
        result = await prisma.task.create({ data: { title, category, priority, userId } });
        break;
      }
      case 'criar_bloco': {
        const [title, dayStr = '0', timeStr = '08:00-09:00'] = data.split('|').map(s => s.trim());
        const dayOfWeek = parseInt(dayStr) || new Date().getDay();
        const [startTime = '08:00', endTime = '09:00'] = timeStr.split('-');
        result = await prisma.routineBlock.create({ data: { title, dayOfWeek, startTime, endTime, userId } });
        break;
      }
      case 'criar_meta': {
        const [name, color = '#7C6FF0', weekTarget = '4'] = data.split('|').map(s => s.trim());
        result = await prisma.studyGoal.create({ data: { name, color, weekTarget: parseInt(weekTarget) || 4, userId } });
        break;
      }
      default:
        return res.status(400).json({ error: 'Tipo de ação desconhecido' });
    }

    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao executar ação' });
  }
});

// ─── Chat History ───

router.get('/sessions', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, _count: { select: { messages: true } } },
    });
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar sessões' });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });
    res.json(session);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar sessão' });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });
    const { title, messages } = req.body;
    const session = await prisma.chatSession.create({
      data: {
        title: title || 'Nova conversa',
        userId,
        messages: messages ? {
          create: messages.map(m => ({ role: m.role, text: m.text })),
        } : undefined,
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    res.status(201).json(session);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
});

router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const { role, text } = req.body;
    if (!role || !text) return res.status(400).json({ error: 'role e text obrigatórios' });
    const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });
    await prisma.chatMessage.create({ data: { role, text, sessionId: req.params.id } });
    await prisma.chatSession.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });
    await prisma.chatSession.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar sessão' });
  }
});

module.exports = router;
