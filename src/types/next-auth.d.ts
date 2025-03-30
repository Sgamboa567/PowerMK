import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    name: string;
    email: string;
    document: string; // Added document field
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    document: string; // Added document field
  }
}