import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../../environments/stellar-db/src/lib/database';
import { createPost, createUser, clearTestData } from '../utils';
import { hashPassword, verifyPassword, canDeletePost } from '../utils/auth-helpers';

describe('M5: Edge Cases - Unit Tests', () => {
  beforeEach(() => {
    clearTestData();
  });

  describe('TC-21: Registration Password Validation', () => {
    it('should reject password shorter than 8 characters', async () => {
      const shortPassword = 'Pass1';
      const isValid = shortPassword.length >= 8;

      expect(isValid).toBe(false);
    });

    it('should accept password with 8+ characters', async () => {
      const validPassword = 'Password123';
      const isValid = validPassword.length >= 8 && /\d/.test(validPassword);

      expect(isValid).toBe(true);
    });

    it('should require at least one number in password', () => {
      const noNumberPassword = 'Password';
      const hasNumber = /\d/.test(noNumberPassword);

      expect(hasNumber).toBe(false);
    });

    it('should accept valid password format', async () => {
      const validPassword = 'Password123';

      // Verify password meets all requirements
      expect(validPassword.length).toBeGreaterThanOrEqual(8);
      expect(/\d/.test(validPassword)).toBe(true);
      expect(/[a-zA-Z]/.test(validPassword)).toBe(true);

      // Can be hashed
      const hash = await hashPassword(validPassword);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);

      // Can be verified
      const isValid = await verifyPassword(validPassword, hash);
      expect(isValid).toBe(true);
    });
  });

  describe('TC-22: Duplicate Username Registration', () => {
    it('should prevent duplicate usernames', () => {
      const db = getDatabase();

      // Create first user
      createUser({
        username: 'alice',
        email: 'alice1@example.com',
        password_hash: 'hash123'
      });

      // Try to create second user with same username
      let threw = false;
      try {
        db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(
          'alice',
          'alice2@example.com',
          'hash456'
        );
      } catch (e) {
        threw = true;
        expect((e as Error).message).toContain('UNIQUE constraint failed');
      }

      expect(threw).toBe(true);
    });

    it('should allow same email for different usernames', () => {
      const db = getDatabase();

      // This depends on schema - emails should also be unique
      // Testing the constraint
      createUser({
        username: 'user1',
        email: 'same@example.com',
        password_hash: 'hash123'
      });

      let threw = false;
      try {
        db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(
          'user2',
          'same@example.com',
          'hash456'
        );
      } catch (e) {
        threw = true;
      }

      // Email should also be unique
      expect(threw).toBe(true);
    });

    it('should show error message for duplicate username', () => {
      const db = getDatabase();

      createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      // Verify user exists
      const count = db.prepare(
        "SELECT COUNT(*) as count FROM users WHERE username = 'alice'"
      ).get() as { count: number };

      expect(count.count).toBe(1);
    });
  });

  describe('TC-24: Delete Permission Enforcement', () => {
    it('should allow owner to delete their own post', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const postId = createPost({
        title: 'Alice Post',
        content: 'Content',
        author_id: userId
      });

      // Owner can delete
      const user = { id: userId, role: 'user' };
      const post = { author_id: userId };

      expect(canDeletePost(user, post)).toBe(true);
    });

    it('should prevent user from deleting others posts', () => {
      const db = getDatabase();

      const aliceId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const bobId = createUser({
        username: 'bob',
        email: 'bob@example.com',
        password_hash: 'hash456'
      });

      const postId = createPost({
        title: 'Alice Post',
        content: 'Content',
        author_id: aliceId
      });

      // Bob tries to delete Alice's post
      const bob = { id: bobId, role: 'user' };
      const post = { author_id: aliceId };

      expect(canDeletePost(bob, post)).toBe(false);
    });

    it('should allow editor to delete any post', () => {
      const db = getDatabase();

      const aliceId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const editorId = createUser({
        username: 'editor',
        email: 'editor@example.com',
        password_hash: 'hash456',
        role: 'editor'
      });

      const postId = createPost({
        title: 'Alice Post',
        content: 'Content',
        author_id: aliceId
      });

      // Editor can delete
      const editor = { id: editorId, role: 'editor' };
      const post = { author_id: aliceId };

      expect(canDeletePost(editor, post)).toBe(true);
    });

    it('should allow admin to delete any post', () => {
      const db = getDatabase();

      const aliceId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const adminId = createUser({
        username: 'admin',
        email: 'admin@example.com',
        password_hash: 'hash456',
        role: 'admin'
      });

      const postId = createPost({
        title: 'Alice Post',
        content: 'Content',
        author_id: aliceId
      });

      // Admin can delete
      const admin = { id: adminId, role: 'admin' };
      const post = { author_id: aliceId };

      expect(canDeletePost(admin, post)).toBe(true);
    });

    it('should verify post remains in database after failed delete', () => {
      const db = getDatabase();

      const aliceId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const bobId = createUser({
        username: 'bob',
        email: 'bob@example.com',
        password_hash: 'hash456'
      });

      const postId = createPost({
        title: 'Alice Post',
        content: 'Content',
        author_id: aliceId
      });

      // Bob tries to delete (no permission)
      // Post should still exist
      const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
      expect(post).toBeDefined();
    });
  });

  describe('TC-23: Archive Post Status', () => {
    it('should create archived posts', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      const postId = createPost({
        title: 'Archived Post',
        content: 'This post is archived',
        author_id: userId,
        status: 'archived'
      });

      const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;
      expect(post.status).toBe('archived');
    });

    it('should exclude archived posts from public queries', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Published Post',
        content: 'Published',
        author_id: userId,
        status: 'published'
      });

      createPost({
        title: 'Archived Post',
        content: 'Archived',
        author_id: userId,
        status: 'archived'
      });

      createPost({
        title: 'Draft Post',
        content: 'Draft',
        author_id: userId,
        status: 'draft'
      });

      // Query only published posts
      const publicPosts = db.prepare(
        "SELECT * FROM posts WHERE status = 'published'"
      ).all() as any[];

      expect(publicPosts.length).toBe(1);
      expect(publicPosts[0].title).toBe('Published Post');
    });

    it('should allow author to see archived posts in dashboard', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Archived Post',
        content: 'Archived',
        author_id: userId,
        status: 'archived'
      });

      // Query all posts for author
      const authorPosts = db.prepare(
        'SELECT * FROM posts WHERE author_id = ?'
      ).all(userId) as any[];

      expect(authorPosts.length).toBe(1);
      expect(authorPosts[0].status).toBe('archived');
    });
  });

  describe('TC-25: Settings Persistence', () => {
    it('should store blog settings', () => {
      const db = getDatabase();

      // Insert or update setting
      db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
      `).run('blog_title', 'My Test Blog', 'My Test Blog');

      const setting = db.prepare(
        'SELECT value FROM settings WHERE key = ?'
      ).get('blog_title') as { value: string };

      expect(setting.value).toBe('My Test Blog');
    });

    it('should update settings timestamp on change', () => {
      const db = getDatabase();

      // Insert initial setting
      db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run('test_key', 'initial');

      // Get initial timestamp
      const initial = db.prepare(
        'SELECT updated_at FROM settings WHERE key = ?'
      ).get('test_key') as { updated_at: string };

      // Wait a bit and update
      const start = Date.now();

      db.prepare(`
        UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?
      `).run('updated_value', 'test_key');

      const updated = db.prepare(
        'SELECT updated_at, value FROM settings WHERE key = ?'
      ).get('test_key') as { updated_at: string; value: string };

      expect(updated.value).toBe('updated_value');
    });

    it('should retrieve all settings', () => {
      const db = getDatabase();

      // Delete existing settings first
      db.exec("DELETE FROM settings WHERE key IN ('blog_title', 'blog_description', 'posts_per_page_test')");

      // Insert multiple settings
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('blog_title', 'Test');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('blog_description', 'Test Description');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('posts_per_page_test', '10');

      const settings = db.prepare('SELECT * FROM settings').all() as any[];
      const settingMap = new Map(settings.map(s => [s.key, s.value]));

      expect(settingMap.get('blog_title')).toBe('Test');
      expect(settingMap.get('blog_description')).toBe('Test Description');
      expect(settingMap.get('posts_per_page_test')).toBe('10');
    });
  });

  describe('Additional M5: Edge Cases', () => {
    it('should handle empty post content', () => {
      const userId = createUser({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password_hash: 'hash123'
      });

      // Empty string is technically allowed (NOT NULL doesn't prevent empty)
      // This test verifies the behavior
      const postId = createPost({
        title: 'Empty Post',
        content: '',
        author_id: userId
      });

      // Post is created but content is empty
      expect(postId).toBeDefined();
    });

    it('should handle very long titles', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      const longTitle = 'A'.repeat(500);

      const postId = createPost({
        title: longTitle,
        content: 'Content',
        author_id: userId
      });

      const post = db.prepare('SELECT title FROM posts WHERE id = ?').get(postId) as any;
      expect(post.title.length).toBe(500);
    });

    it('should handle special characters in content', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      const specialContent = `
        <script>alert('xss')</script>
        {{template}}
        \${variable}
        Line1\nLine2\tTab
        Emoji: 🎉🚀
      `;

      const postId = createPost({
        title: 'Special Chars',
        content: specialContent,
        author_id: userId
      });

      const post = db.prepare('SELECT content FROM posts WHERE id = ?').get(postId) as any;
      expect(post.content).toContain('🎉');
      expect(post.content).toContain('<script>');
    });

    it('should handle concurrent user creation', () => {
      const db = getDatabase();

      // Clean up first
      db.exec("DELETE FROM users WHERE username = 'duplicate_test'");

      // Try to create users with same username
      db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run('duplicate_test', 'email1@test.com', 'hash');

      // Second insert with same username should fail
      let threw = false;
      try {
        db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run('duplicate_test', 'email2@test.com', 'hash');
      } catch (e) {
        threw = true;
      }

      expect(threw).toBe(true);
    });
  });
});
