const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);

    const filter = req.query.filter || 'all';
    const where = { userId };

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (filter === 'today') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = { gte: today, lt: tomorrow };
    } else if (filter === 'overdue') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'DONE' };
    } else if (filter === 'done') {
      where.status = 'DONE';
    }

    const tasks = await prisma.task.findMany({ where, orderBy: [{ status: 'asc' }, { dueDate: 'asc' }] });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar tarefas' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json({ pending: 0, highPriority: 0, doneThisWeek: 0 });
    const [pending, highPriority, doneThisWeek] = await Promise.all([
      prisma.task.count({ where: { userId, status: { not: 'DONE' } } }),
      prisma.task.count({ where: { userId, priority: 'HIGH', status: { not: 'DONE' } } }),
      prisma.task.count({ where: { userId, status: 'DONE', completedAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    ]);
    res.json({ pending, highPriority, doneThisWeek });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar stats' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Campo título obrigatório' });
    }

    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });
    const task = await prisma.task.create({
      data: { title: req.body.title, category: req.body.category || 'Geral', priority: req.body.priority || 'MEDIUM', userId },
    });
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const result = await prisma.task.groupBy({
      by: ['category'],
      where: { userId, status: { not: 'DONE' } },
      _count: true,
    });
    res.json(result.map((r) => ({ category: r.category, count: r._count })));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar categorias' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Não encontrada' });
    const completed = !(task.status === 'DONE');
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: completed ? 'DONE' : 'TODO', completedAt: completed ? new Date() : null },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao alternar tarefa' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Não encontrada' });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Não encontrada' });

    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.priority !== undefined) data.priority = req.body.priority;
    if (req.body.dueDate !== undefined) data.dueDate = req.body.dueDate;

    const updated = await prisma.task.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

module.exports = router;
