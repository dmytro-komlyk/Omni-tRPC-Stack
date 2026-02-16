import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string | null;
    nickName: string | null;
    avatarUrl: string | null;
    accessToken: string;
    accessTokenExp: Date | string | number; // Бэкенд может вернуть строку или дату
    refreshTokenExp: Date | string | number;
    sessionToken: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
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
    email: string | null;
    nickName: string | null;
    avatarUrl: string | null;
    accessToken: string;
    accessTokenExp: number;
    refreshTokenExp: number;
    sessionToken: string;
  }
}
