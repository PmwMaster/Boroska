const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/today', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json(null);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const workout = await prisma.workout.findFirst({ where: { userId, date: { gte: todayStart } }, include: { exercises: true } });
    res.json(workout);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar treino' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const workout = await prisma.workout.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(workout);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

router.patch('/exercises/:id/toggle', async (req, res) => {
  try {
    const exercise = await prisma.workoutExercise.findUnique({ where: { id: req.params.id } });
    if (!exercise) return res.status(404).json({ error: 'Não encontrado' });
    const updated = await prisma.workoutExercise.update({
      where: { id: req.params.id },
      data: { isDone: !exercise.isDone },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao alternar exercício' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });

    const { muscleGroup, notes, exercises } = req.body;

    if (!muscleGroup || typeof muscleGroup !== 'string' || !muscleGroup.trim()) {
      return res.status(400).json({ error: 'Campo grupo muscular obrigatório' });
    }

    const workout = await prisma.workout.create({
      data: {
        muscleGroup: muscleGroup.trim(),
        notes: notes || null,
        userId,
        exercises: {
          create: (exercises || []).map((e) => ({
            name: e.name,
            series: e.series || 4,
            repsMin: e.repsMin || 8,
            repsMax: e.repsMax || 12,
            weight: e.weight ?? null,
          })),
        },
      },
      include: { exercises: true },
    });
    res.status(201).json(workout);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar treino' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const workout = await prisma.workout.findUnique({ where: { id: req.params.id } });
    if (!workout) return res.status(404).json({ error: 'Não encontrado' });
    await prisma.workout.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar treino' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const workout = await prisma.workout.findUnique({ where: { id: req.params.id } });
    if (!workout) return res.status(404).json({ error: 'Não encontrado' });

    const data = {};
    if (req.body.muscleGroup !== undefined) data.muscleGroup = req.body.muscleGroup;
    if (req.body.notes !== undefined) data.notes = req.body.notes;

    if (req.body.exercises !== undefined) {
      await prisma.workoutExercise.deleteMany({ where: { workoutId: req.params.id } });
      await prisma.workoutExercise.createMany({
        data: req.body.exercises.map((e) => ({
          name: e.name,
          series: e.series || 4,
          repsMin: e.repsMin || 8,
          repsMax: e.repsMax || 12,
          weight: e.weight ?? null,
          workoutId: req.params.id,
        })),
      });
    }

    const updated = await prisma.workout.update({
      where: { id: req.params.id },
      data,
      include: { exercises: true },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar treino' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json({ streak: 0, totalWorkouts: 0, thisWeek: 0 });

    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await prisma.workout.count({
        where: { userId, status: 'COMPLETED', date: { gte: dayStart, lt: dayEnd } }
      });
      if (count === 0) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const totalWorkouts = await prisma.workout.count({ where: { userId } });
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeek = await prisma.workout.count({ where: { userId, date: { gte: weekStart } } });

    res.json({ streak, totalWorkouts, thisWeek });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar stats' });
  }
});

router.delete('/exercises/:id', async (req, res) => {
  try {
    const exercise = await prisma.workoutExercise.findUnique({ where: { id: req.params.id } });
    if (!exercise) return res.status(404).json({ error: 'Não encontrado' });
    await prisma.workoutExercise.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar exercício' });
  }
});

module.exports = router;
