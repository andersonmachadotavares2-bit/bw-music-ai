import { supabaseAdmin } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não informado.' });
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }

  req.user = user;
  req.accessToken = token;
  return next();
}
