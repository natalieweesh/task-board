import express from 'express';
import { prisma } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username } = req.body ?? {};
  if (typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'username required' });
  }
  const user = await prisma.user.upsert({
    where: { username: username.trim() },
    update: {},
    create: { username: username.trim() },
  });
  const session = await prisma.session.create({
    data: { userId: user.id },
  });
  res.json({ sessionId: session.id, user });
});

router.post('/logout', async (req, res) => {
  const { sessionId } = req.body ?? {};
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }
  res.status(204).end();
});

export default router;
