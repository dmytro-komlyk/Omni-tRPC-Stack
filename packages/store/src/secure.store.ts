import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const;

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEYS.access, accessToken);
    await SecureStore.setItemAsync(TOKEN_KEYS.refresh, refreshToken);
  } catch (error) {
    console.error('SecureStore save error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.access);
  } catch (error) {
    console.error('SecureStore get access error:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.refresh);
  } catch (error) {
    console.error('SecureStore get refresh error:', error);
    return null;
  }
};

export const deleteTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.access);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.refresh);
  } catch (error) {
    console.error('SecureStore delete error:', error);
    throw error;
  }
};

export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getAccessToken();
  return !!token;
};

export const getTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

  return { accessToken, refreshToken };
};
