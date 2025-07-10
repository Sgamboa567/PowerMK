import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';

// Cliente para operaciones administrativas
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
          console.log("Credenciales incompletas");
          return null;
        }

        try {
          // Trim y normalización del documento
          const normalizedDocument = credentials.document.trim();
          console.log(`Buscando usuario con documento normalizado: '${normalizedDocument}'`);
          
          // Buscar el usuario por documento
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, name, document, password, role')
            .eq('document', normalizedDocument)
            .single();

          if (userError) {
            console.error('Error buscando usuario por documento:', userError);
            return null;
          }

          if (!userData) {
            console.error('No se encontró usuario con el documento:', normalizedDocument);
            return null;
          }

          console.log(`Usuario encontrado: ${userData.name} (${userData.email})`);
          
          // Verificación simple de contraseña (texto plano)
          if (userData.password === credentials.password) {
            console.log('Autenticación exitosa con verificación directa de contraseña');
            
            // Devolver el usuario para crear sesión
            return {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              document: userData.document,
              image: userData.image
            };
          } else {
            console.log('Contraseña incorrecta en verificación directa');
          }
          
          try {
            console.log('Intentando autenticación con Supabase Auth...');
            const { data, error } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: credentials.password,
            });

            if (error) {
              console.error('Error de autenticación con Supabase Auth:', error);
              return null;
            }

            if (!data.user) {
              console.error('No se obtuvo usuario en la respuesta de Supabase Auth');
              return null;
            }

            console.log('Autenticación exitosa con Supabase Auth');
            return {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              document: userData.document,
              image: userData.image
            };
          } catch (authError) {
            console.error('Error en proceso de Supabase Auth:', authError);
            return null;
          }
          
        } catch (error) {
          console.error('Error general en el proceso de autenticación:', error);
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
        token.image = user.image;
        console.log(`JWT callback: token creado para ${user.email}, role=${user.role}`);
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.document = token.document as string;
        console.log(`Session callback: sesión creada para usuario ID=${token.id}`);
      }
      return session;
    }
  },
  debug: true
}