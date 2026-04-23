import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (error) => {
  console.error('Erro inesperado no PostgreSQL:', error);
});

export async function initDatabase() {
  const query = `
    CREATE TABLE IF NOT EXISTS musics (
      id SERIAL PRIMARY KEY,
      prompt TEXT NOT NULL,
      url TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(query);
}
