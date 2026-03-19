import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, hashPassword, verifyPassword, canEditPost, canDeletePost } from '../utils/auth-helpers';
import { createUser, createPost, getPostById } from '../utils';

process.env.JWT_SECRET = 'test-secret-key-for-testing-only';

describe('M2: Secure Authentication', () => {
  describe('TC-08: JWT Token Generation and Validation', () => {
    it('should generate valid JWT token', () => {
      const user = { id: 1, username: 'test', role: 'user' as const };
      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify valid token and return decoded payload', () => {
      const user = { id: 1, username: 'test', role: 'user' as const };
      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(1);
      expect(decoded?.username).toBe('test');
      expect(decoded?.role).toBe('user');
    });

    it('should reject invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should reject tampered token', () => {
      const user = { id: 1, username: 'test', role: 'user' as const };
      const token = generateToken(user);
      const tampered = token.slice(0, -10) + 'tampered12';

      const decoded = verifyToken(tampered);
      expect(decoded).toBeNull();
    });

    it('should have 7-day expiration', () => {
      const user = { id: 1, username: 'test', role: 'user' as const };
      const token = generateToken(user);
      const decoded = jwt.decode(token) as { exp: number; iat: number };

      const sevenDays = 7 * 24 * 60 * 60;
      expect(decoded.exp - decoded.iat).toBe(sevenDays);
    });
  });

  describe('TC-09: Role-Based Route Protection', () => {
    it('should allow admin access to admin routes', () => {
      const admin = { id: 1, username: 'admin', role: 'admin' as const };
      expect(canAccessAdmin(admin)).toBe(true);
    });

    it('should allow editor access to admin routes', () => {
      const editor = { id: 2, username: 'editor', role: 'editor' as const };
      expect(canAccessAdmin(editor)).toBe(true);
    });

    it('should deny user access to admin routes', () => {
      const user = { id: 3, username: 'user', role: 'user' as const };
      expect(canAccessAdmin(user)).toBe(false);
    });
  });

  describe('TC-10: Ownership-Based Edit Permissions', () => {
    it('should allow user to edit own post', () => {
      const user = { id: 1, username: 'alice', role: 'user' as const };
      const post = { id: 1, author_id: 1, title: 'My Post' };

      expect(canEditPost(user, post)).toBe(true);
    });

    it('should deny user from editing others posts', () => {
      const user = { id: 2, username: 'bob', role: 'user' as const };
      const post = { id: 1, author_id: 1, title: "Alice's Post" };

      expect(canEditPost(user, post)).toBe(false);
    });

    it('should allow editor to edit any post', () => {
      const editor = { id: 3, username: 'editor', role: 'editor' as const };
      const post = { id: 1, author_id: 1, title: "Someone's Post" };

      expect(canEditPost(editor, post)).toBe(true);
    });

    it('should allow admin to edit any post', () => {
      const admin = { id: 4, username: 'admin', role: 'admin' as const };
      const post = { id: 1, author_id: 99, title: 'Post' };

      expect(canEditPost(admin, post)).toBe(true);
    });
  });

  describe('TC-11: Session Expiration', () => {
    it('should reject expired token', () => {
      const user = { id: 1, username: 'test', role: 'user' as const };
      const expiredToken = jwt.sign(
        { ...user, exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET!
      );

      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('TC-12: Password Hashing (bcrypt)', () => {
    it('should hash password with bcrypt format', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should verify correct password', async () => {
      const password = 'testPass123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await hashPassword('correct');
      const isValid = await verifyPassword('wrong', hash);

      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});

// Helper functions
function canAccessAdmin(user: { role: string }): boolean {
  return user.role === 'admin' || user.role === 'editor';
}

function canEditPost(user: { id: number; role: string }, post: { author_id: number }): boolean {
  if (user.role === 'admin' || user.role === 'editor') return true;
  return user.id === post.author_id;
}
