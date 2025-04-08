import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '@/lib/supabase';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        document: { label: "Document", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.document || !credentials?.password) {
          return null;
        }

        try {
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('document', credentials.document)
            .eq('password', credentials.password)
            .single();

          if (error || !user) return null;

          return {
            id: user.id,
            name: user.name || user.document,
            email: user.email,
            role: user.role,
            document: user.document
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login'
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
      if (session.user) {
        session.user.role = token.role;
        session.user.document = token.document;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Manejar redirecciones personalizadas
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  }
});

export { handler as GET, handler as POST };