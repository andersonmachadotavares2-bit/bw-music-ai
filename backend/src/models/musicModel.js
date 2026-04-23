import { pool } from '../config/db.js';

export async function createMusic({ prompt, url }) {
  const query = `
    INSERT INTO musics (prompt, url)
    VALUES ($1, $2)
    RETURNING id, prompt, url, "createdAt";
  `;

  const { rows } = await pool.query(query, [prompt, url]);
  return rows[0];
}

export async function listMusics() {
  const query = `
    SELECT id, prompt, url, "createdAt"
    FROM musics
    ORDER BY "createdAt" DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
}
