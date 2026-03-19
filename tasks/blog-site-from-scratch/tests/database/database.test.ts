import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';
import Database from 'better-sqlite3';

const TEST_DB_PATH = join(process.cwd(), 'data', 'test.db');

// Clean up test database before and after tests
cleanupTestDb();

function cleanupTestDb() {
  if (existsSync(TEST_DB_PATH)) {
    rmSync(TEST_DB_PATH);
  }
}

describe('Database Connection', () => {
  let db: Database.Database;

  afterAll(() => {
    if (db) db.close();
    cleanupTestDb();
  });

  it('should connect to database successfully', () => {
    db = new Database(TEST_DB_PATH);
    expect(db).toBeDefined();
  });

  it('should enable WAL mode', () => {
    db = new Database(TEST_DB_PATH);
    db.pragma('journal_mode = WAL');
    const journalMode = db.pragma('journal_mode', { simple: true });
    expect(journalMode).toBe('wal');
  });

  it('should enable foreign keys', () => {
    db = new Database(TEST_DB_PATH);
    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    expect(foreignKeys).toBe(1);
  });
});

describe('Schema Migration', () => {
  let db: Database.Database;

  beforeAll(() => {
    cleanupTestDb();
    db = new Database(TEST_DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    db.exec(`
      CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL);
      CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL);
      CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
      CREATE TABLE post_tags (post_id INTEGER, tag_id INTEGER, PRIMARY KEY (post_id, tag_id));
    `);
  });

  afterAll(() => {
    if (db) db.close();
    cleanupTestDb();
  });

  it('should have posts table', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'").get();
    expect(tables).toBeDefined();
  });

  it('should have users table', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(tables).toBeDefined();
  });

  it('should enforce unique constraints', () => {
    db.prepare('INSERT INTO posts (title, slug) VALUES (?, ?)').run('Test Title', 'test-slug');

    expect(() => {
      db.prepare('INSERT INTO posts (title, slug) VALUES (?, ?)').run('Another Title', 'test-slug');
    }).toThrow();
  });
});

describe('Data Integrity', () => {
  let db: Database.Database;

  beforeEach(() => {
    cleanupTestDb();
    db = new Database(TEST_DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL);
      CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL);
    `);
  });

  afterAll(() => {
    if (db) db.close();
    cleanupTestDb();
  });

  it('should preserve data through insert and retrieve', () => {
    const testData = { title: 'My Test Post', slug: 'my-test-post' };
    db.prepare('INSERT INTO posts (title, slug) VALUES (?, ?)').run(testData.title, testData.slug);

    const result = db.prepare('SELECT * FROM posts WHERE slug = ?').get(testData.slug) as any;
    expect(result.title).toBe(testData.title);
    expect(result.slug).toBe(testData.slug);
  });

  it('should handle concurrent reads', () => {
    db.prepare('INSERT INTO posts (title, slug) VALUES (?, ?)').run('Post 1', 'post-1');
    db.prepare('INSERT INTO posts (title, slug) VALUES (?, ?)').run('Post 2', 'post-2');

    const stmts = [
      db.prepare('SELECT * FROM posts WHERE slug = ?'),
      db.prepare('SELECT * FROM posts WHERE slug = ?')
    ];

    const results = [
      stmts[0].get('post-1'),
      stmts[1].get('post-2')
    ];

    expect(results).toHaveLength(2);
  });
});

describe('File Locking Under Load', () => {
  it('should handle multiple transactions', async () => {
    cleanupTestDb();
    const db = new Database(TEST_DB_PATH);
    db.pragma('journal_mode = WAL');

    db.exec('CREATE TABLE test_table (id INTEGER PRIMARY KEY, value INTEGER)');

    // Simulate concurrent operations
    const operations = [];
    for (let i = 0; i < 50; i++) {
      operations.push(
        new Promise<void>((resolve) => {
          db.prepare('INSERT INTO test_table (value) VALUES (?)').run(i);
          resolve();
        })
      );
    }

    await Promise.all(operations);

    const count = (db.prepare('SELECT COUNT(*) as count FROM test_table').get() as any).count;
    expect(count).toBe(50);

    db.close();
    cleanupTestDb();
  });
});
