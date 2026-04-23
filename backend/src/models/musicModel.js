import { supabaseAdmin } from '../config/supabase.js';

export async function createMusic({ prompt, url, userId }) {
  const { data, error } = await supabaseAdmin
    .from('musics')
    .insert({
      prompt,
      url,
      user_id: userId,
    })
    .select('id, prompt, url, created_at, user_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listMusics(userId) {
  const { data, error } = await supabaseAdmin
    .from('musics')
    .select('id, prompt, url, created_at, user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
