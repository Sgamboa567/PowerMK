import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        document: { label: "Documento", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Log detallado para depuración
        console.log('⭐️ Intento de autorización iniciado');
        
        if (!credentials?.document || !credentials?.password) {
          console.log('❌ Faltan credenciales');
          return null;
        }

        try {
          // Trim y normalización del documento
          const normalizedDocument = credentials.document.trim();
          console.log(`🔍 Buscando usuario con documento: ${normalizedDocument}`);
          
          // OPCIÓN 1: Buscar por documento
          console.log('📊 Consultando Supabase por documento...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*') // Seleccionar todos los campos para depuración
            .eq('document', normalizedDocument)
            .single();

          if (userError) {
            console.error('❌ Error al buscar por documento:', userError.message);
            // Continuar para intentar por email
          } else if (userData) {
            console.log('✅ Usuario encontrado por documento');
            
            // Verificación de contraseña
            console.log('🔐 Verificando contraseña...');
            console.log('Contraseña proporcionada:', credentials.password);
            console.log('Contraseña almacenada (hash):', userData.password ? '[PRESENTE]' : '[AUSENTE]');
            
            if (userData.password === credentials.password) {
              console.log('✅ Contraseña correcta, autenticación exitosa');
              // Devolver el usuario para crear sesión
              return {
                id: userData.id,
                email: userData.email || 'no-email@example.com',
                name: userData.name || 'Usuario',
                role: userData.role || 'user',
                document: userData.document,
                image: userData.image || null
              };
            } else {
              console.log('❌ Contraseña incorrecta');
              return null;
            }
          } else {
            console.log('❓ Usuario no encontrado por documento, intentando con email');
          }
          
          // OPCIÓN 2: Intentar buscar por correo electrónico
          console.log('📧 Consultando Supabase por email...');
          const { data: emailUser, error: emailError } = await supabase
            .from('users')
            .select('*') // Seleccionar todos los campos para depuración
            .eq('email', normalizedDocument)
            .single();
              
          if (emailError) {
            console.error('❌ Error al buscar por email:', emailError.message);
            return null;
          }
            
          if (!emailUser) {
            console.log('❌ Usuario no encontrado por ningún método');
            return null;
          }
            
          console.log('✅ Usuario encontrado por email');
          
          // Verificación de contraseña
          console.log('🔐 Verificando contraseña para usuario por email...');
          
          if (emailUser.password === credentials.password) {
            console.log('✅ Contraseña correcta, autenticación exitosa');
            return {
              id: emailUser.id,
              email: emailUser.email || 'no-email@example.com',
              name: emailUser.name || 'Usuario',
              role: emailUser.role || 'user',
              document: emailUser.document,
              image: emailUser.image || null
            };
          }
          
          console.log('❌ Contraseña incorrecta para usuario encontrado por email');
          return null;
          
        } catch (error) {
          console.error('⚠️ Error inesperado en el proceso de autenticación:', error);
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.document = token.document as string;
        session.user.image = token.image as string;
      }
      return session;
    }
  },
  debug: true // Habilitamos el modo debug para ver más detalles
};