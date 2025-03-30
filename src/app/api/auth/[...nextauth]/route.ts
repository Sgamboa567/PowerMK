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

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('document', credentials.document)
          .eq('password', credentials.password)
          .single();

        if (error || !user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          document: user.document, // Ensure this field is included
        };
      }
    })
  ],
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
        session.user.role = token.role;
        session.user.document = token.document;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };