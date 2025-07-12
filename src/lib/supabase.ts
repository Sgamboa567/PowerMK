import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificación de variables de entorno de forma silenciosa en producción
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Variables de entorno de Supabase no configuradas correctamente');
  }
}

const timeoutMs = 10000; // 10 segundos

// Crear una función de fetch con timeout
const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  return fetch(url, { ...options, signal })
    .finally(() => clearTimeout(timeout));
};

// Y usar esta función en el cliente Supabase
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: { autoRefreshToken: true, persistSession: true },
    global: { fetch: fetchWithTimeout }
  }
);

// Función de utilidad para verificar la conexión
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count(*)').limit(1);
    return { success: !error, data, error };
  } catch (err) {
    return { success: false, error: err };
  }
}