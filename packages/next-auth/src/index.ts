import type { AuthConfig } from '@auth/core';
import { getRemoteServerClient } from '@package/api/server';
import { CredentialsSignin, type Session, type User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthConfig = {
  debug: true,
  trustHost: true,
  secret: process.env.AUTH_SECRET as string,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      id: 'login',
      name: 'Login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User> {
        try {
          const remoteServerClient = getRemoteServerClient();
          const response = await remoteServerClient.auth.login.mutate(
            credentials as { email: string; password: string }
          );

          return {
            id: response.user.id,
            email: response.user.email,
            nickName: response.user.nickName,
            avatarUrl: response.user.avatarUrl,
            accessToken: response.accessToken,
            accessTokenExp: response.accessTokenExp,
            refreshTokenExp: response.refreshTokenExp,
            sessionToken: response.sessionToken,
          };
        } catch (error: any) {
          console.error('Authorize Error:', error.message);
          class CustomAuthError extends CredentialsSignin {
            override code = error.message;
          }

          throw new CustomAuthError();
        }
      },
    }),
  ],
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in',
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
        domain: process.env.APP_HOSTNAME as string,
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
        domain: process.env.APP_HOSTNAME as string,
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
        domain: process.env.APP_HOSTNAME as string,
      },
    },
  },
  callbacks: {
    signIn: async ({ user, account, profile }): Promise<boolean> => {
      const remoteServerClient = getRemoteServerClient();
      if (account && account?.provider !== 'login') {
        try {
          const response = await remoteServerClient.auth.loginProvider.mutate({
            email: user.email || null,
            nickName: user.email?.split('@')[0] || null,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            firstName: profile?.given_name as string,
            lastName: profile?.family_name as string,
            avatarUrl: user.image as string,
          });

          user.id = response.user.id;
          user.accessToken = response.accessToken;
          user.accessTokenExp = response.accessTokenExp;
          user.refreshTokenExp = response.refreshTokenExp;
          user.nickName = response.user.nickName;

          return true;
        } catch (error) {
          console.error('LoginProvider Error:', error);
          return false;
        }
      }
      return true;
    },

    jwt: async ({ token, user }: { token: JWT; user: User }): Promise<JWT> => {
      console.log(`Auth JWT Token = ${JSON.stringify(token)}`);
      console.log(`Auth JWT User = ${JSON.stringify(user)}`);
      const remoteServerClient = getRemoteServerClient(token.sessionToken);
      if (user) {
        return {
          ...token,
          id: user.id as string,
          email: user.email as string,
          nickName: user.nickName as string,
          accessToken: user.accessToken as string,
          sessionToken: user.sessionToken as string,
          accessTokenExp: Math.floor(new Date(user.accessTokenExp).getTime() / 1000),
          refreshTokenExp: Math.floor(new Date(user.refreshTokenExp).getTime() / 1000),
          error: undefined,
        };
      }

      const currentTime = Math.floor(Date.now() / 1000);

      if (token.refreshTokenExp && currentTime >= token.refreshTokenExp) {
        console.warn('Refresh token expired, session is dead.');
        token.error = 'RefreshTokenExpired';
        return token;
      }

      if (token.accessTokenExp && currentTime < (token.accessTokenExp as number) - 30) {
        return token;
      }
      try {
        const updated = await remoteServerClient.auth.refresh.mutate({
          email: token.email as string,
          sub: token.id as string,
        });

        delete token.error;

        return {
          ...token,
          accessToken: updated.accessToken,
          accessTokenExp: Math.floor(new Date(updated.accessTokenExp).getTime() / 1000),
        };
      } catch (error) {
        console.error('RefreshAccessTokenError', error);
        token.error = 'RefreshAccessTokenError';
        return token;
      }
    },

    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          nickName: token.nickName as string,
          accessToken: token.accessToken as string,
          sessionToken: token.sessionToken as string,
        };
        (session as any).error = token.error || null;
      }
      return session;
    },
  },
};

export * from 'next-auth';
export * from 'next-auth/react';
