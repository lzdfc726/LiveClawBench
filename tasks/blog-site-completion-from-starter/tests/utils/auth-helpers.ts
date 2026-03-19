/**
 * Authentication Test Helpers
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const SALT_ROUNDS = 10;

export interface TokenPayload {
  id: number;
  username: string;
  role: 'admin' | 'editor' | 'user';
}

export function generateToken(user: TokenPayload): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function canEditPost(
  user: { id: number; role: string },
  post: { author_id: number }
): boolean {
  if (user.role === 'admin' || user.role === 'editor') return true;
  return user.id === post.author_id;
}

export function canDeletePost(
  user: { id: number; role: string },
  post: { author_id: number }
): boolean {
  return canEditPost(user, post); // Same permissions for delete
}

export function canAccessAdmin(user: { role: string }): boolean {
  return user.role === 'admin' || user.role === 'editor';
}
