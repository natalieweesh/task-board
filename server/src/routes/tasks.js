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

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

router.post('/', async (req, res) => {
  const { title, description, status } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title required' });
  }
  const taskStatus = VALID_STATUSES.includes(status) ? status : 'TODO';
  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      status: taskStatus,
      createdById: req.user.id,
    },
    include: { createdBy: true },
  });
  req.app.get('io').emit('task:created', task);
  res.status(201).json(task);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id } });
    req.app.get('io').emit('task:deleted', { id });
    res.status(204).end();
  } catch (err) {
    // P2025: Prisma's "record not found" — thrown by update/delete when the where clause matches no rows
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    throw err;
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body ?? {};
  const data = {};
  if (typeof title === 'string' && title.trim()) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    data.status = status;
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'no valid fields to update' });
  }
  try {
    const task = await prisma.task.update({
      where: { id },
      data,
      include: { createdBy: true },
    });
    req.app.get('io').emit('task:updated', task);
    res.json(task);
  } catch (err) {
    // P2025: Prisma's "record not found" — thrown by update/delete when the where clause matches no rows
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    throw err;
  }
});

export default router;
