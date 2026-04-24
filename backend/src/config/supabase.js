import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias no backend.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function initDatabase() {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.warn(`Falha ao acessar Supabase na inicialização: ${error.message}`);
      return;
    }

    console.log('Supabase conectado com sucesso');
  } catch (err) {
    console.warn(`Erro ao conectar no Supabase: ${err.message}`);
  }
}
