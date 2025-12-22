import { serverClient } from '@package/api';
import { formatInTimeZone } from 'date-fns-tz';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: any = {
  debug: true,
  trustProxy: true,
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'Login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const response = await serverClient.auth.login(
            credentials as { email: string; password: string }
          );
          return response;
        } catch (error) {
          console.error(error);
          return Promise.reject(
            new Error(
              'Authorization error, check that you entered your email and password correctly'
            )
          );
        }
      },
    }),
  ],
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  cookies: {
    callbackUrl: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Secure-authjs.callback-url`
          : `authjs.callback-url`,
      options: {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        domain: process.env.AUTH_DOMAIN as string,
      },
    },
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Secure-authjs.session-token`
          : `authjs.session-token`,
      options: {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        domain: process.env.AUTH_DOMAIN as string,
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production' ? '__Secure-authjs.csrf-token' : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.AUTH_DOMAIN as string,
      },
    },
  },
  callbacks: {
    authorized({ auth }: { auth: { user?: User } }) {
      const isAuthenticated = !!auth?.user;

      return isAuthenticated;
    },
    jwt: async ({ token, user }: { token: JWT; user: User }): Promise<JWT> => {
      console.log(`Auth JWT Token = ${JSON.stringify(token)}`);
      console.log(`Auth JWT User = ${JSON.stringify(user)}`);

      const currentTime = new Date().getTime() / 1000;

      if (user) {
        token.id = user.id as string;
        token.nickName = user.nickName;
        token.email = user.email as string;
        token.accessToken = user.accessToken;
        token.isLogined = user.isLogined;
        token.accessTokenExp = user.accessTokenExp;
        token.refreshTokenExp = user.refreshTokenExp;
      }
      console.log(token.refreshTokenExp, currentTime, token.refreshTokenExp);
      if (token.refreshTokenExp && currentTime > token.refreshTokenExp) {
        console.log('Refresh token expired');
        return {};
      }

      if (token.accessTokenExp && currentTime > token.accessTokenExp - 5) {
        const updatedAccessToken = await serverClient.auth.updateAccessBackendToken({
          email: token.email as string,
          sub: token.id as string,
        });
        token.accessToken = updatedAccessToken.accessToken;
        token.accessTokenExp = updatedAccessToken.accessTokenExp;
      }
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      console.log(`Session Callback - Token: ${JSON.stringify(token)}`);

      if (!token.sub) {
        session.user = null;
        session.expires = formatInTimeZone(new Date(0), 'UTC', "yyyy-MM-dd'T'HH:mm:ssXXX");
        return session;
      }

      const expiresInUserZone = formatInTimeZone(
        new Date((token.refreshTokenExp || 0) * 1000),
        'UTC',
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      return {
        ...session,
        user: {
          id: token.id,
          nickName: token.nickName,
          email: token.email,
          accessToken: token.accessToken,
          accessTokenExp: token.accessTokenExp,
          refreshTokenExp: token.refreshTokenExp,
          isLogined: token.isLogined,
        },
        expires: expiresInUserZone,
      };
    },
  },
};

export * from 'next-auth';
export * from 'next-auth/react';
