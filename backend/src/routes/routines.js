const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const day = parseInt(req.query.day) || new Date().getDay();
    const blocks = await prisma.routineBlock.findMany({ where: { userId, dayOfWeek: day }, orderBy: { startTime: 'asc' } });
    res.json(blocks);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar rotina' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json({ completed: 0, total: 0, streak: 0 });

    const today = new Date();
    const day = today.getDay();

    const [completed, total] = await Promise.all([
      prisma.routineBlock.count({ where: { userId, dayOfWeek: day, isCompleted: true } }),
      prisma.routineBlock.count({ where: { userId, dayOfWeek: day } }),
    ]);

    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dow = checkDate.getDay();
      const total = await prisma.routineBlock.count({ where: { userId, dayOfWeek: dow } });
      if (total === 0) break;
      const done = await prisma.routineBlock.count({ where: { userId, dayOfWeek: dow, isCompleted: true } });
      if (done < total) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({ completed, total, streak });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar stats' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });

    const { title, dayOfWeek, startTime, endTime } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Campo título obrigatório' });
    }
    if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Campo dia da semana obrigatório' });
    }
    if (!startTime) {
      return res.status(400).json({ error: 'Campo horário de início obrigatório' });
    }
    if (!endTime) {
      return res.status(400).json({ error: 'Campo horário de fim obrigatório' });
    }

    const block = await prisma.routineBlock.create({
      data: { title: title.trim(), dayOfWeek, startTime, endTime, userId },
    });
    res.status(201).json(block);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar bloco de rotina' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const block = await prisma.routineBlock.findUnique({ where: { id: req.params.id } });
    if (!block) return res.status(404).json({ error: 'Não encontrado' });
    const updated = await prisma.routineBlock.update({
      where: { id: req.params.id },
      data: { isCompleted: !block.isCompleted },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao alternar bloco' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const block = await prisma.routineBlock.findUnique({ where: { id: req.params.id } });
    if (!block) return res.status(404).json({ error: 'Não encontrado' });
    await prisma.routineBlock.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar bloco de rotina' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const block = await prisma.routineBlock.findUnique({ where: { id: req.params.id } });
    if (!block) return res.status(404).json({ error: 'Não encontrado' });

    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.startTime !== undefined) data.startTime = req.body.startTime;
    if (req.body.endTime !== undefined) data.endTime = req.body.endTime;
    if (req.body.icon !== undefined) data.icon = req.body.icon;
    if (req.body.dayOfWeek !== undefined) data.dayOfWeek = req.body.dayOfWeek;

    const updated = await prisma.routineBlock.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar bloco de rotina' });
  }
});

module.exports = router;
