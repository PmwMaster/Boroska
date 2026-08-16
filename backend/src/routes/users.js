const express = require('express');
const { prisma } = require('../prisma');
const { getUserId } = require('../utils');
const router = express.Router();

router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({ select: { id: true, name: true, email: true, createdAt: true } });
    if (!user) return res.status(404).json({ error: 'Sem usuário' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar usuário' });
  }
});

router.patch('/me', async (req, res) => {
  try {
    const { name, email } = req.body;

    if ((!name || typeof name !== 'string' || !name.trim()) && (!email || typeof email !== 'string' || !email.trim())) {
      return res.status(400).json({ error: 'Campo nome ou email obrigatório' });
    }

    const userId = await getUserId();
    if (!userId) return res.status(404).json({ error: 'Sem usuário' });
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: name?.trim() || undefined, email: email?.trim() || undefined },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;
