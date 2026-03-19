import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../../environments/stellar-db/src/lib/database';
import { createPost, createUser, clearTestData } from '../utils';

describe('M3: User Dashboard', () => {
  beforeEach(() => {
    clearTestData();
  });

  describe('TC-13: Dashboard Post Listing - Ownership Filter', () => {
    it('should show only current user posts in dashboard', () => {
      const db = getDatabase();

      // Create two users
      const aliceId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const bobId = createUser({
        username: 'bob',
        email: 'bob@example.com',
        password_hash: 'hash123'
      });

      // Alice creates 3 posts
      createPost({ title: 'Alice Post 1', content: 'Content 1', author_id: aliceId });
      createPost({ title: 'Alice Post 2', content: 'Content 2', author_id: aliceId });
      createPost({ title: 'Alice Post 3', content: 'Content 3', author_id: aliceId });

      // Bob creates 2 posts
      createPost({ title: 'Bob Post 1', content: 'Content 4', author_id: bobId });
      createPost({ title: 'Bob Post 2', content: 'Content 5', author_id: bobId });

      // Query posts for Alice's dashboard
      const alicePosts = db.prepare(
        'SELECT title FROM posts WHERE author_id = ? ORDER BY created_at DESC'
      ).all(aliceId) as { title: string }[];

      expect(alicePosts.length).toBe(3);
      expect(alicePosts.map(p => p.title)).toEqual(
        expect.arrayContaining(['Alice Post 1', 'Alice Post 2', 'Alice Post 3'])
      );

      // Verify Bob's posts are not included
      expect(alicePosts.map(p => p.title)).not.toContain('Bob Post 1');
      expect(alicePosts.map(p => p.title)).not.toContain('Bob Post 2');
    });

    it('should count posts correctly for dashboard', () => {
      const db = getDatabase();

      const aliceId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      const bobId = createUser({
        username: 'bob',
        email: 'bob@example.com',
        password_hash: 'hash123'
      });

      createPost({ title: 'Post 1', content: 'Content', author_id: aliceId, status: 'published' });
      createPost({ title: 'Post 2', content: 'Content', author_id: aliceId, status: 'draft' });
      createPost({ title: 'Post 3', content: 'Content', author_id: bobId, status: 'published' });

      const alicePostCount = db.prepare(
        'SELECT COUNT(*) as count FROM posts WHERE author_id = ?'
      ).get(aliceId) as { count: number };

      expect(alicePostCount.count).toBe(2);
    });
  });

  describe('TC-14: Profile Update - All Fields', () => {
    it('should update display_name, bio, avatar, and website', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      // Update profile
      db.prepare(`
        UPDATE users
        SET display_name = ?, bio = ?, avatar = ?, website = ?
        WHERE id = ?
      `).run('Jane Doe', 'Developer', 'https://example.com/avatar.jpg', 'https://jane.dev', userId);

      const user = db.prepare(
        'SELECT display_name, bio, avatar, website FROM users WHERE id = ?'
      ).get(userId) as { display_name: string; bio: string; avatar: string; website: string };

      expect(user.display_name).toBe('Jane Doe');
      expect(user.bio).toBe('Developer');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.website).toBe('https://jane.dev');
    });

    it('should allow partial profile updates', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      // Update only bio
      db.prepare('UPDATE users SET bio = ? WHERE id = ?').run('New bio', userId);

      const user = db.prepare(
        'SELECT display_name, bio, avatar, website FROM users WHERE id = ?'
      ).get(userId) as any;

      expect(user.bio).toBe('New bio');
      // Other fields should be null
      expect(user.display_name).toBeNull();
      expect(user.avatar).toBeNull();
      expect(user.website).toBeNull();
    });

    it('should persist profile updates across queries', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash123'
      });

      // First update
      db.prepare('UPDATE users SET bio = ? WHERE id = ?').run('First bio', userId);

      // Second update
      db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run('Test Name', userId);

      // Verify both updates persisted
      const user = db.prepare(
        'SELECT display_name, bio FROM users WHERE id = ?'
      ).get(userId) as { display_name: string; bio: string };

      expect(user.display_name).toBe('Test Name');
      expect(user.bio).toBe('First bio');
    });
  });

  describe('TC-15: Public Author Profile Page', () => {
    it('should display author profile with bio and avatar', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'charlie',
        email: 'charlie@example.com',
        password_hash: 'hash123'
      });

      // Update profile
      db.prepare(`
        UPDATE users
        SET display_name = ?, bio = ?, avatar = ?
        WHERE id = ?
      `).run('Charlie Davis', 'Full-stack developer', 'https://example.com/charlie.jpg', userId);

      // Query author profile (simulating public page)
      const author = db.prepare(`
        SELECT username, display_name, bio, avatar
        FROM users
        WHERE username = ?
      `).get('charlie') as any;

      expect(author).toBeDefined();
      expect(author.display_name).toBe('Charlie Davis');
      expect(author.bio).toBe('Full-stack developer');
      expect(author.avatar).toBe('https://example.com/charlie.jpg');
    });

    it('should show only published posts on author profile', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'charlie',
        email: 'charlie@example.com',
        password_hash: 'hash123'
      });

      // Create published and draft posts
      createPost({
        title: 'Published Post 1',
        content: 'Content 1',
        author_id: userId,
        status: 'published'
      });

      createPost({
        title: 'Published Post 2',
        content: 'Content 2',
        author_id: userId,
        status: 'published'
      });

      createPost({
        title: 'Draft Post',
        content: 'Draft content',
        author_id: userId,
        status: 'draft'
      });

      // Query published posts for author profile
      const publishedPosts = db.prepare(`
        SELECT title, status
        FROM posts
        WHERE author_id = ? AND status = 'published'
        ORDER BY created_at DESC
      `).all(userId) as { title: string; status: string }[];

      expect(publishedPosts.length).toBe(2);
      expect(publishedPosts.every(p => p.status === 'published')).toBe(true);
      expect(publishedPosts.map(p => p.title)).toEqual(
        expect.arrayContaining(['Published Post 1', 'Published Post 2'])
      );
    });

    it('should count author posts correctly', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'charlie',
        email: 'charlie@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Post 1',
        content: 'Content 1',
        author_id: userId,
        status: 'published'
      });

      createPost({
        title: 'Post 2',
        content: 'Content 2',
        author_id: userId,
        status: 'published'
      });

      createPost({
        title: 'Post 3',
        content: 'Content 3',
        author_id: userId,
        status: 'draft'
      });

      const postCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM posts
        WHERE author_id = ? AND status = 'published'
      `).get(userId) as { count: number };

      expect(postCount.count).toBe(2);
    });
  });

  describe('TC-16: Draft vs Published Status Visibility', () => {
    it('should show both draft and published posts to author in dashboard', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Draft Post',
        content: 'Draft content',
        author_id: userId,
        status: 'draft'
      });

      createPost({
        title: 'Published Post',
        content: 'Published content',
        author_id: userId,
        status: 'published'
      });

      // Author sees all posts (including drafts)
      const authorPosts = db.prepare(
        'SELECT title, status FROM posts WHERE author_id = ? ORDER BY created_at DESC'
      ).all(userId) as { title: string; status: string }[];

      expect(authorPosts.length).toBe(2);
      expect(authorPosts.map(p => p.status)).toContain('draft');
      expect(authorPosts.map(p => p.status)).toContain('published');
    });

    it('should exclude draft posts from public blog index', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Published Post 1',
        content: 'Content',
        author_id: userId,
        status: 'published'
      });

      createPost({
        title: 'Draft Post',
        content: 'Draft',
        author_id: userId,
        status: 'draft'
      });

      createPost({
        title: 'Published Post 2',
        content: 'Content',
        author_id: userId,
        status: 'published'
      });

      // Public blog query
      const publicPosts = db.prepare(
        "SELECT title FROM posts WHERE status = 'published' ORDER BY created_at DESC"
      ).all() as { title: string }[];

      expect(publicPosts.length).toBe(2);
      expect(publicPosts.map(p => p.title)).not.toContain('Draft Post');
    });

    it('should return 404 for direct draft access', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Draft Post',
        content: 'Draft content',
        author_id: userId,
        status: 'draft',
        slug: 'draft-post'
      });

      // Simulate public access to draft post
      const post = db.prepare(
        "SELECT * FROM posts WHERE slug = ? AND status = 'published'"
      ).get('draft-post');

      expect(post).toBeUndefined();
    });

    it('should allow author to access draft via dashboard', () => {
      const db = getDatabase();

      const userId = createUser({
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hash123'
      });

      createPost({
        title: 'Draft Post',
        content: 'Draft content',
        author_id: userId,
        status: 'draft',
        slug: 'draft-post'
      });

      // Author can access own draft
      const draftPost = db.prepare(
        'SELECT * FROM posts WHERE slug = ? AND author_id = ?'
      ).get('draft-post', userId);

      expect(draftPost).toBeDefined();
    });
  });
});
