import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        document: { label: "Documento", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.document || !credentials?.password) {
          return null;
        }

        // Buscar usuario en Supabase
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('document', credentials.document)
          .single();

        if (error || !user) {
          return null;
        }

        // Verificar contraseña (usar bcrypt en producción)
        const isValidPassword = user.password === credentials.password;

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          document: user.document,
          role: user.role,
        };
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.document = user.document;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.document = token.document as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };