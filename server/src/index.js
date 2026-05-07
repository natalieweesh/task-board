import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.set('io', io);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
