import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  login,
  createAdminUser,
  createUser
} from '../../src/lib/auth';
import Database from 'better-sqlite3';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';

const TEST_DB_PATH = join(process.cwd(), 'data', 'test.db');
process.env.JWT_SECRET = 'test-secret-key';

function cleanup() {
  if (existsSync(TEST_DB_PATH)) {
    rmSync(TEST_DB_PATH);
  }
}

describe('Password Hashing', () => {
  it('should hash password with salt', async () => {
    const password = 'mySecurePassword123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(0);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt hash format
  });

  it('should verify correct password', async () => {
    const password = 'mySecurePassword123';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'mySecurePassword123';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('wrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('should generate different hashes for same password', async () => {
    const password = 'samePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});

describe('JWT Token Management', () => {
  it('should generate valid token', () => {
    const user = { id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' as const };
    const token = generateToken(user);

    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify valid token', () => {
    const user = { id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' as const };
    const token = generateToken(user);
    const decoded = verifyToken(token);

    expect(decoded).toBeDefined();
    expect(decoded?.username).toBe(user.username);
    expect(decoded?.id).toBe(user.id);
  });

  it('should reject invalid token', () => {
    const decoded = verifyToken('invalid.token.here');
    expect(decoded).toBeNull();
  });

  it('should reject tampered token', () => {
    const user = { id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' as const };
    const token = generateToken(user);
    const tamperedToken = token.slice(0, -10) + 'tamperedxx';

    const decoded = verifyToken(tamperedToken);
    expect(decoded).toBeNull();
  });
});

describe('Authentication', () => {
  let db: Database.Database;

  beforeAll(() => {
    cleanup();
    db = new Database(TEST_DB_PATH);
    db.pragma('journal_mode = WAL');
  });

  afterAll(() => {
    if (db) db.close();
    cleanup();
  });

  beforeEach(() => {
    // Recreate users table
    db.exec('DROP TABLE IF EXISTS users');
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
});

describe('Brute Force Protection', () => {
  it('should handle multiple failed attempts gracefully', async () => {
    // This is a conceptual test - actual rate limiting would be implemented at the middleware level
    const attempts = [];
    for (let i = 0; i < 5; i++) {
      attempts.push(
        verifyPassword('wrong', await hashPassword('correct'))
      );
    }

    const results = await Promise.all(attempts);
    expect(results.every(r => r === false)).toBe(true);
  });
});

describe('Session Expiration', () => {
  it('should reject expired token', () => {
    const user = { id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' as const };

    // Create an expired token manually
    const expiredToken = jwt.sign(
      { ...user, exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET!
    );

    const decoded = verifyToken(expiredToken);
    expect(decoded).toBeNull();
  });
});
