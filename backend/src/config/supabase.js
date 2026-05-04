import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn('AVISO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas. Algumas funcionalidades podem falhar.');
}

export { supabaseAdmin };

export async function initDatabase() {
  if (!supabaseAdmin) {
    console.warn('Banco de dados não inicializado: Chaves do Supabase ausentes.');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('musics')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.warn(`Aviso de conexão Supabase: ${error.message}`);
      return;
    }

    console.log('✅ Supabase conectado com sucesso');
  } catch (err) {
    console.warn(`Erro na conexão com Supabase: ${err.message}`);
  }
}
