import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

export async function generateTwoFactorSecret(userEmail: string) {
  const secret = generateSecret();
  const appName = process.env.APP_NAME as string;

  const otpauthUrl = generateURI({
    issuer: appName,
    label: userEmail,
    secret,
  });

  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret,
    qrCodeUrl,
  };
}

export async function verifyTwoFactorToken(token: string, secret: string): Promise<boolean> {
  try {
    const isValid = await verify({ token, secret });
    return !!isValid;
  } catch (err) {
    console.error('2FA Verification Error:', err);
    return false;
  }
}

export async function generateBackupCodes() {
  const codes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  const hashedCodes = await Promise.all(codes.map((code) => hash(code, 12)));

  return {
    plain: codes,
    hashed: hashedCodes,
  };
}
