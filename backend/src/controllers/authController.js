import { supabaseAdmin } from '../config/supabase.js';

export async function signUp(req, res) {
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
}

export async function signIn(req, res) {
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
}

export async function signOut(_, res) {
  return res.status(200).json({
    message: 'Logout realizado. Remova o token no cliente com supabase.auth.signOut().',
  });
}

export async function recoverPassword(req, res) {
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
}

export async function getMe(req, res) {
  const user = req.user;
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return res.status(200).json({ user, profile });
}

export async function syncProfile(req, res) {
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
}
