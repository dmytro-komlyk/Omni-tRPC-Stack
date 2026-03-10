import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string | null;
    role: string;
    nickName: string | null;
    avatarUrl: string | null;
    accessToken: string;
    accessTokenExp: Date | string | number;
    refreshTokenExp: Date | string | number;
    sessionToken: string;
    clientId: string | undefined;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      nickName: string;
      accessToken: string;
      sessionToken: string;
    } & DefaultSession['user'];
    error?: 'RefreshAccessTokenError' | 'RefreshTokenExpired';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    email: string | null;
    nickName: string | null;
    avatarUrl: string | null;
    accessToken: string;
    accessTokenExp: number;
    refreshTokenExp: number;
    sessionToken: string;
  }
}
