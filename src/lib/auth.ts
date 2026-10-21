import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthSession } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'imi_super_secret_jwt_key_2026_independent_minds';
export const TOKEN_COOKIE_NAME = 'imi_admin_token';

export function signToken(session: Omit<AuthSession, 'iat' | 'exp'>): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthSession;
    return decoded;
  } catch {
    return null;
  }
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function verifyAdminRequest(req: NextRequest): Promise<AuthSession | null> {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = verifyToken(token);
    if (session) return session;
  }

  // Check cookie
  const cookieToken = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (cookieToken) {
    const session = verifyToken(cookieToken);
    if (session) return session;
  }

  return null;
}
