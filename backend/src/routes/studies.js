const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json({ todayMinutes: 0, streak: 0, projectProgress: 0 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayResult = await prisma.studySession.aggregate({ where: { userId, date: { gte: today } }, _sum: { duration: true } });

    let streak = 0;
    for (let i = 0; ; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await prisma.studySession.count({ where: { userId, date: { gte: dayStart, lt: dayEnd } } });
      if (count === 0) break;
      streak++;
    }

    const firstGoal = await prisma.studyGoal.findFirst({ where: { userId }, orderBy: { progress: 'desc' }, select: { progress: true } });

    res.json({
      todayMinutes: todayResult._sum.duration ?? 0,
      streak,
      projectProgress: firstGoal?.progress ?? 0,
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar stats' });
  }
});

router.get('/goals', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const goals = await prisma.studyGoal.findMany({ where: { userId }, orderBy: { progress: 'desc' } });
    res.json(goals);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar metas' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const limit = parseInt(req.query.limit) || 5;
    const sessions = await prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: limit });
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar sessões' });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { subject, duration } = req.body;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Campo matéria obrigatório' });
    }
    if (!duration || parseInt(duration) <= 0) {
      return res.status(400).json({ error: 'Campo duração obrigatório' });
    }

    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });
    const session = await prisma.studySession.create({
      data: {
        subject: subject.trim(),
        topic: req.body.topic || '',
        duration: parseInt(duration),
        userId,
      },
    });
    res.status(201).json(session);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await prisma.studySession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Não encontrada' });
    await prisma.studySession.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar sessão' });
  }
});

router.patch('/sessions/:id', async (req, res) => {
  try {
    const session = await prisma.studySession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Não encontrada' });

    const data = {};
    if (req.body.subject !== undefined) data.subject = req.body.subject;
    if (req.body.topic !== undefined) data.topic = req.body.topic;
    if (req.body.duration !== undefined) data.duration = req.body.duration;
    if (req.body.notes !== undefined) data.notes = req.body.notes;

    const updated = await prisma.studySession.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar sessão' });
  }
});

router.post('/goals', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });

    const { name, progress, color, weekTarget, weekDone } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Campo nome obrigatório' });
    }

    const goal = await prisma.studyGoal.create({
      data: {
        name: name.trim(),
        progress: progress || 0,
        color: color || '#7C6FF0',
        weekTarget: weekTarget || 24,
        weekDone: weekDone || 0,
        userId,
      },
    });
    res.status(201).json(goal);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

router.delete('/goals/:id', async (req, res) => {
  try {
    const goal = await prisma.studyGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ error: 'Não encontrada' });
    await prisma.studyGoal.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar meta' });
  }
});

module.exports = router;
