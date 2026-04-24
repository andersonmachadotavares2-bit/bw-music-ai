import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import musicRoutes from './routes/musicRoutes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
  'http://localhost:3000',
  'https://bw-music-ai.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS não permitido'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/', authRoutes);
app.use('/', musicRoutes);

export default app;
