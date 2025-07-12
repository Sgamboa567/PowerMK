import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Cliente para operaciones administrativas (aunque actualmente no se usa)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        document: { label: "Documento", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.document || !credentials?.password) {
          return null;
        }

        try {
          // Trim y normalización del documento
          const normalizedDocument = credentials.document.trim();
          
          // Buscar el usuario por documento - MODIFICAR AQUÍ PARA INCLUIR IMAGE
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, name, document, password, role, image')
            .eq('document', normalizedDocument)
            .single();

          if (userError || !userData) {
            return null;
          }

          // Verificación simple de contraseña (texto plano)
          if (userData.password === credentials.password) {
            // Devolver el usuario para crear sesión
            return {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              document: userData.document,
              image: userData.image || null // Añadir null como fallback
            };
          }
          
          // Intento alternativo con Supabase Auth si la verificación directa falla
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: credentials.password,
            });

            if (error || !data.user) {
              return null;
            }

            return {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              document: userData.document,
              image: userData.image || null // Añadir null como fallback
            };
          } catch {
            return null;
          }
        } catch {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.document = user.document;
        token.image = user.image || null; // Añadir null como fallback
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.document = token.document as string;
        session.user.image = token.image as string || null; // Añadir image al session
      }
      return session;
    }
  },
  debug: false // Desactivar modo debug en producción
}