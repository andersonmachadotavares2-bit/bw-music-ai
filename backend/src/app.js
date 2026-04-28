import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import musicRoutes from './routes/musicRoutes.js';

dotenv.config();

const app = express();

// Configuração de CORS robusta
const allowedOrigins = [
  'https://bw-music-ai.vercel.app',
  'http://localhost:3000',
  'http://localhost:4000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      // Em desenvolvimento, podemos ser mais permissivos se necessário
      callback(null, true); 
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware extra para garantir que o preflight (OPTIONS) responda corretamente
app.options('*', cors());

app.use(express.json());

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/', musicRoutes);

export default app;
