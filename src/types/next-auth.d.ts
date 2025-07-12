import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      document: string;
      image?: string;
      subscription_status?: string;
      subscription_end_date?: string;
    }
  }
  
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    document: string;
    image?: string;
    subscription_status?: string;
    subscription_end_date?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    document: string;
  }
}