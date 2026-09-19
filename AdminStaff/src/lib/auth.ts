import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'secret';

export interface AdminPayload {
  id: number;
  role: 'superadmin' | 'admin' | 'staff';
  name: string;
}

export async function signToken(payload: AdminPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(payload: AdminPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

