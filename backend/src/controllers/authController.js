import { supabaseAdmin } from '../config/supabase.js';
import logger from '../config/logger.js';

export async function signUp(req, res) {
  logger.info('Attempting signup', { email: req.body.email });
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
        },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || null,
      });
    }

    return res.status(201).json(data);
  } catch (error) {
    logger.error('Signup error:', error);
    return res.status(500).json({ message: error.message });
  }
}

export async function signIn(req, res) {
  logger.info('Attempting login', { email: req.body.email });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ message: error.message });
  }
}

export async function signOut(_, res) {
  logger.info('Attempting logout');
  try {
    return res.status(200).json({
      message: 'Logout realizado. Remova o token no cliente com supabase.auth.signOut().',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({ message: error.message });
  }
}

export async function recoverPassword(req, res) {
  logger.info('Attempting password recovery', { email: req.body.email });
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.SUPABASE_RECOVERY_REDIRECT_URL,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: 'Se existir uma conta com esse email, enviaremos as instruções de recuperação.',
    });
  } catch (error) {
    logger.error('Recover password error:', error);
    return res.status(500).json({ message: error.message });
  }
}

export async function getMe(req, res) {
  logger.info('Fetching user profile', { userId: req.user?.id });
  try {
    const user = req.user;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('id', user.id)
      .maybeSingle();

    return res.status(200).json({ user, profile });
  } catch (error) {
    logger.error('Get user profile error:', error);
    return res.status(500).json({ message: error.message });
  }
}

export async function syncProfile(req, res) {
  logger.info('Attempting profile sync', { userId: req.user?.id });
  try {
    const user = req.user;
    const fullName = user.user_metadata?.full_name || null;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
      })
      .select('id, email, full_name, created_at')
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Sync profile error:', error);
    return res.status(500).json({ message: error.message });
  }
}
