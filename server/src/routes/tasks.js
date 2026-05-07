import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'asc' },
    include: { createdBy: true },
  });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { title, description, status } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title required' });
  }
  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  const taskStatus = validStatuses.includes(status) ? status : 'TODO';
  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      status: taskStatus,
      createdById: req.user.id,
    },
    include: { createdBy: true },
  });
  res.status(201).json(task);
});

export default router;
