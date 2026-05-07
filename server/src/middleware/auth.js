import { prisma } from '../db.js';

export async function requireAuth(req, res, next) {
  const sessionId = req.header('x-session-id');
  if (!sessionId) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  req.user = session.user;
  req.session = session;
  next();
}
