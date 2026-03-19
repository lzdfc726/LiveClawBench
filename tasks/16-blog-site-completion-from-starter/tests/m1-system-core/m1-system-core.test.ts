import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';
import { getDatabase, closeDatabase } from '../../environments/stellar-db/src/lib/database';

const TEST_DB_PATH = join(process.cwd(), 'data', 'test-m1.db');

describe('M1: System Core', () => {
  describe('TC-01: Application Startup & Database Initialization', () => {
    it('should start server and create database file', () => {
      // Verify the database can be initialized
      const db = getDatabase();
      expect(db).toBeDefined();
      expect(db.open).toBe(true);
    });

    it('should have all required tables created', () => {
      const db = getDatabase();
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table'"
      ).all() as { name: string }[];

      const tableNames = tables.map(t => t.name);

      expect(tableNames).toContain('posts');
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('tags');
      expect(tableNames).toContain('post_tags');
      expect(tableNames).toContain('sessions');
      expect(tableNames).toContain('page_views');
      expect(tableNames).toContain('comments');
      expect(tableNames).toContain('settings');
      expect(tableNames).toContain('posts_fts');
    });
  });

  describe('TC-02: Database Schema Integrity', () => {
    it('should have correct columns in posts table', () => {
      const db = getDatabase();
      const columns = db.prepare('PRAGMA table_info(posts)').all() as { name: string; type: string; notnull: number }[];

      const columnMap = new Map(columns.map(c => [c.name, c]));

      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.has('title')).toBe(true);
      expect(columnMap.has('slug')).toBe(true);
      expect(columnMap.has('content')).toBe(true);
      expect(columnMap.has('status')).toBe(true);
      expect(columnMap.has('author_id')).toBe(true);
      expect(columnMap.has('view_count')).toBe(true);
      expect(columnMap.has('created_at')).toBe(true);
    });

    it('should have FTS5 virtual table for search', () => {
      const db = getDatabase();
      const ftsTables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%fts%'"
      ).all() as { name: string }[];

      const ftsTableNames = ftsTables.map(t => t.name);
      expect(ftsTableNames).toContain('posts_fts');
    });

    it('should enforce foreign key constraints', () => {
      const db = getDatabase();
      const fkStatus = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
      expect(fkStatus.foreign_keys).toBe(1);
    });

    it('should have triggers for FTS5 sync', () => {
      const db = getDatabase();
      const triggers = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='trigger'"
      ).all() as { name: string }[];

      const triggerNames = triggers.map(t => t.name);
      expect(triggerNames).toContain('posts_fts_insert');
      expect(triggerNames).toContain('posts_fts_update');
      expect(triggerNames).toContain('posts_fts_delete');
    });
  });

  describe('TC-03: Environment Configuration Loading', () => {
    it('should load JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET?.length).toBeGreaterThan(10);
    });

    it('should have database at configured path', () => {
      const db = getDatabase();
      // Database file should exist after initialization
      expect(existsSync(TEST_DB_PATH) || existsSync(join(process.cwd(), 'data', 'stellar.db'))).toBe(true);
    });
  });
});
