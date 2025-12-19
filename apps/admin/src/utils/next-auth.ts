import { authOptions } from '@package/next-auth/options';
import NextAuth from 'next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
