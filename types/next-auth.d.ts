import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id?: string;
    email?: string | null;
    nickName: string;
    accessToken: string;
    accessTokenExp: number;
    refreshToken?: string;
    refreshTokenExp: number;
    isLogined: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      nickName: string;
      accessToken: string;
      accessTokenExp: number;
      refreshTokenExp: number;
      isLogined: boolean;
    } | null;
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    nickName?: string;
    accessToken?: string;
    refreshToken?: string;
    isLogined?: boolean;
    accessTokenExp?: number;
    refreshTokenExp?: number;
  }
}
