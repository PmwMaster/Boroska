const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json({ balance: 0, weekExpenses: 0, weekData: [] });

    const incomeRaw = await prisma.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } });
    const expensesRaw = await prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } });
    const weekRaw = await prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: new Date(Date.now() - 7 * 86400000) } },
      _sum: { amount: true },
    });

    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [dayIncome, dayExpense] = await Promise.all([
        prisma.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: dayStart, lt: dayEnd } }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: dayStart, lt: dayEnd } }, _sum: { amount: true } }),
      ]);

      weekData.push({
        entradas: dayIncome._sum.amount ?? 0,
        saidas: dayExpense._sum.amount ?? 0,
      });
    }

    res.json({
      balance: (incomeRaw._sum.amount ?? 0) - (expensesRaw._sum.amount ?? 0),
      weekExpenses: weekRaw._sum.amount ?? 0,
      weekData,
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const limit = parseInt(req.query.limit) || 10;
    const transactions = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: limit });
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar transações' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const userId = await getUserId();
    if (!userId) return res.json([]);
    const result = await prisma.transaction.groupBy({ by: ['category'], where: { userId, type: 'EXPENSE' }, _sum: { amount: true } });

    const meta = {
      alimentacao: { name: 'Alimentação', icon: 'restaurant', color: '#c9a74d' },
      moradia: { name: 'Moradia', icon: 'home', color: '#60a5fa' },
      assinaturas: { name: 'Assinaturas', icon: 'subscriptions', color: '#a78bfa' },
      transporte: { name: 'Transporte', icon: 'directions_car', color: '#34d399' },
      outros: { name: 'Outros', icon: 'category', color: '#9ca3af' },
      salario: { name: 'Salário', icon: 'work', color: '#10b981' },
      freelance: { name: 'Freelance', icon: 'laptop', color: '#f59e0b' },
    };

    res.json(result.map((r) => ({ category: r.category, ...(meta[r.category] || { name: r.category, icon: 'category', color: '#9ca3af' }), amount: r._sum.amount ?? 0 })));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar categorias' });
  }
});

router.post('/', async (req, res) => {
  try {
    const amount = parseFloat(req.body.amount);
    const { description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Campo valor obrigatório' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Campo descrição obrigatório' });
    }

    const userId = await getUserId();
    if (!userId) return res.status(400).json({ error: 'Sem usuário' });
    const tx = await prisma.transaction.create({
      data: {
        type: req.body.type || 'EXPENSE',
        category: req.body.category || 'outros',
        amount,
        description: description.trim(),
        userId,
      },
    });
    res.status(201).json(tx);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tx = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!tx) return res.status(404).json({ error: 'Não encontrada' });
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const tx = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!tx) return res.status(404).json({ error: 'Não encontrada' });

    const data = {};
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.amount !== undefined) data.amount = req.body.amount;
    if (req.body.description !== undefined) data.description = req.body.description;

    const updated = await prisma.transaction.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

module.exports = router;
