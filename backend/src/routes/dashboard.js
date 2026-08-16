const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.status(404).json({ error: 'Nenhum usuário encontrado' });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, createdAt: true } });

    const [pendingTasks, highPriorityTasks, todaysRoutine, studyGoals, lastWorkout, studyToday] = await Promise.all([
      prisma.task.count({ where: { userId, status: { not: 'DONE' } } }),
      prisma.task.count({ where: { userId, priority: 'HIGH', status: { not: 'DONE' } } }),
      prisma.routineBlock.findMany({ where: { userId, dayOfWeek: new Date().getDay() }, orderBy: { startTime: 'asc' } }),
      prisma.studyGoal.findMany({ where: { userId }, orderBy: { progress: 'desc' }, take: 4 }),
      prisma.workout.findFirst({ where: { userId }, orderBy: { date: 'desc' }, include: { exercises: { take: 3 } } }),
      prisma.studySession.aggregate({ where: { userId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }, _sum: { duration: true } }),
    ]);

    const income = await prisma.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } });
    const allExpenses = await prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } });
    const weekExpenses = await prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: new Date(Date.now() - 7 * 86400000) } }, _sum: { amount: true } });

    res.json({
      user,
      pendingTasks,
      highPriorityTasks,
      todaysRoutine,
      studyGoals,
      lastWorkout,
      studyTodayMinutes: studyToday._sum.duration ?? 0,
      studyStreak: await (async () => {
        let s = 0;
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        while (true) {
          const ds = new Date(d);
          const de = new Date(d);
          de.setDate(de.getDate() + 1);
          const c = await prisma.studySession.count({ where: { userId: user.id, date: { gte: ds, lt: de } } });
          if (c === 0) break;
          s++;
          d.setDate(d.getDate() - 1);
        }
        return s;
      })(),
      finance: {
        balance: (income._sum.amount ?? 0) - (allExpenses._sum.amount ?? 0),
        weekExpenses: weekExpenses._sum.amount ?? 0,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

module.exports = router;
