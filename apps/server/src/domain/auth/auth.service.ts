import { prisma } from '@package/prisma';

import { OutputUserData } from '../user/user.schema';
import { createUser, updateUser, validateUser } from '../user/user.service';
import {
  InputBackendTokens,
  OutputAccessToken,
  OutputAuthData,
  SignInFormData,
  SignUpFormData,
} from './auth.schema';
import { generateBackendTokens } from './jwt.service';

export async function signIn(data: SignInFormData): Promise<OutputAuthData> {
  return await validateUser(data);
}

export async function signOut(id: string): Promise<boolean> {
  const updatedUser = await updateUser({ id, isLogined: false });
  return updatedUser.isLogined;
}

export async function signUp(data: SignUpFormData): Promise<OutputUserData> {
  return await createUser(data);
}

export async function updateAccessBackendToken(
  payload: InputBackendTokens
): Promise<OutputAccessToken> {
  const { accessToken, accessTokenExp } = await generateBackendTokens(payload);
  const updatedAccessToken = await prisma.token.upsert({
    where: { type_userId: { userId: payload.sub, type: 'ACCESS' } },
    update: { token: accessToken },
    create: {
      userId: payload.sub,
      type: 'ACCESS',
      token: accessToken,
      expires: accessTokenExp,
    },
  });

  return {
    accessToken: updatedAccessToken.token,
    accessTokenExp: updatedAccessToken.expires,
  };
}
