import { authOptions } from '@package/next-auth/options';
import NextAuth from 'next-auth';

const { handlers } = NextAuth(authOptions);

export const { GET, POST } = handlers;
