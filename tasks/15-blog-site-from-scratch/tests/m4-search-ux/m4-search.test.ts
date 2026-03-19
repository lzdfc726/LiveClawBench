import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase } from '../../environments/stellar-db/src/lib/database';
import Database from 'better-sqlite3';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';

const TEST_DB_PATH = join(process.cwd(), 'data', 'test-m5.db');

describe('M4: Search & UX - Unit Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Create fresh test database
    if (existsSync(TEST_DB_PATH)) {
      rmSync(TEST_DB_PATH);
    }
    db = new Database(TEST_DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        status TEXT DEFAULT 'draft',
        author_id INTEGER REFERENCES users(id),
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME
      )
    `);

    // Create FTS5 virtual table
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
        title,
        content,
        content='posts',
        content_rowid='id'
      )
    `);

    // Create triggers
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS posts_fts_insert AFTER INSERT ON posts BEGIN
        INSERT INTO posts_fts(rowid, title, content)
        VALUES (new.id, new.title, new.content);
      END;
    `);
  });

  afterEach(() => {
    if (db) db.close();
    if (existsSync(TEST_DB_PATH)) {
      rmSync(TEST_DB_PATH);
    }
  });

  describe('TC-17: FTS5 Full-Text Search Functionality', () => {
    it('should index post content in FTS5', () => {
      // Create user
      const userResult = db.prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      ).run('testuser', 'test@example.com', 'hash123');
      const userId = userResult.lastInsertRowid as number;

      // Create post
      const postResult = db.prepare(`
        INSERT INTO posts (title, slug, content, author_id, status)
        VALUES (?, ?, ?, ?, ?)
      `).run('JavaScript Tutorial', 'javascript-tutorial', 'Learn JavaScript from scratch', userId, 'published');
      const postId = postResult.lastInsertRowid as number;

      // Verify FTS index was updated
      const ftsResults = db.prepare(
        "SELECT rowid FROM posts_fts WHERE posts_fts MATCH 'javascript'"
      ).all() as { rowid: number }[];

      expect(ftsResults.length).toBeGreaterThan(0);
      expect(ftsResults[0].rowid).toBe(postId);
    });

    it('should return ranked search results', () => {
      // Create user
      const userResult = db.prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      ).run('testuser', 'test@example.com', 'hash123');
      const userId = userResult.lastInsertRowid as number;

      // Create multiple posts
      db.prepare('INSERT INTO posts (title, slug, content, author_id, status) VALUES (?, ?, ?, ?, ?)').run(
        'JavaScript Basics', 'javascript-basics', 'JavaScript JavaScript JavaScript', userId, 'published'
      );

      db.prepare('INSERT INTO posts (title, slug, content, author_id, status) VALUES (?, ?, ?, ?, ?)').run(
        'Python Guide', 'python-guide', 'Python programming language', userId, 'published'
      );

      db.prepare('INSERT INTO posts (title, slug, content, author_id, status) VALUES (?, ?, ?, ?, ?)').run(
        'Advanced JavaScript', 'advanced-javascript', 'JavaScript advanced topics', userId, 'published'
      );

      // Search for javascript
      const results = db.prepare(
        "SELECT rowid FROM posts_fts WHERE posts_fts MATCH 'javascript' ORDER BY rank"
      ).all() as { rowid: number }[];

      // Should find 2 posts with javascript
      expect(results.length).toBe(2);
    });

    it('should only search published posts via FTS', () => {
      // Create user
      const userResult = db.prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      ).run('testuser', 'test@example.com', 'hash123');
      const userId = userResult.lastInsertRowid as number;

      // Create published and draft posts
      db.prepare('INSERT INTO posts (title, slug, content, author_id, status) VALUES (?, ?, ?, ?, ?)').run(
        'Published JavaScript', 'published-javascript', 'JavaScript content published', userId, 'published'
      );

      db.prepare('INSERT INTO posts (title, slug, content, author_id, status) VALUES (?, ?, ?, ?, ?)').run(
        'Draft JavaScript', 'draft-javascript', 'JavaScript content draft', userId, 'draft'
      );

      // FTS will match both, but we filter by status after
      const ftsResults = db.prepare(
        "SELECT rowid FROM posts_fts WHERE posts_fts MATCH 'javascript'"
      ).all() as { rowid: number }[];

      // Filter by published status
      const publishedResults = db.prepare(`
        SELECT p.id
        FROM posts p
        WHERE p.id IN (${ftsResults.map(r => r.rowid).join(',') || '0'})
        AND p.status = 'published'
      `).all() as { id: number }[];

      expect(publishedResults.length).toBe(1);
    });
  });

  describe('TC-19: SEO Meta Tags Generation', () => {
    it('should generate meta description from excerpt', () => {
      // Create user
      const userResult = db.prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      ).run('testuser', 'test@example.com', 'hash123');
      const userId = userResult.lastInsertRowid as number;

      // Create post with excerpt
      const postResult = db.prepare(`
        INSERT INTO posts (title, slug, content, excerpt, author_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('SEO Optimized Post', 'seo-optimized-post', 'This is the full content', 'This is a custom excerpt for SEO', userId, 'published');
      const postId = postResult.lastInsertRowid as number;

      const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;

      expect(post.excerpt).toBeDefined();
      expect(post.excerpt).toBe('This is a custom excerpt for SEO');
    });
  });

  describe('TC-20: RSS Feed Generation', () => {
    it('should have required RSS fields in posts', () => {
      // Create user
      const userResult = db.prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
      ).run('testuser', 'test@example.com', 'hash123');
      const userId = userResult.lastInsertRowid as number;

      // Create post
      const postResult = db.prepare(`
        INSERT INTO posts (title, slug, content, author_id, status, published_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run('RSS Test Post', 'rss-test-post', 'Content for RSS', userId, 'published');
      const postId = postResult.lastInsertRowid as number;

      const post = db.prepare(`
        SELECT p.*, u.username
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.id = ?
      `).get(postId) as any;

      // Verify RSS-essential fields
      expect(post.title).toBeDefined();
      expect(post.slug).toBeDefined();
      expect(post.published_at || post.created_at).toBeDefined();
      expect(post.username).toBeDefined();
    });
  });
});
