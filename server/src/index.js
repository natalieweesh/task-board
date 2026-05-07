import express from 'express';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
