import { createClient } from '@supabase/supabase-js'

// Verificación más robusta de variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error: Variables de entorno de Supabase no configuradas');
  }
  // En producción, proporcionamos una instancia con un URL vacío pero evitamos interrumpir la compilación
  // La app manejará la falla de conexión más elegantemente
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key-for-build-process',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    db: {
      schema: 'public'
    }
  }
)