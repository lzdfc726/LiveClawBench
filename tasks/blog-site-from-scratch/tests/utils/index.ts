/**
 * Test Utilities for Stellar-DB
 */

import { getDatabase } from '../../environments/stellar-db/src/lib/database';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

export interface CreatePostInput {
  title: string;
  content: string;
  author_id: number;
  status?: 'draft' | 'published' | 'archived';
  excerpt?: string;
  slug?: string;
}

export function createPost(input: CreatePostInput): number {
  const db = getDatabase();
  const slug = input.slug || generateSlug(input.title);

  const result = db.prepare(`
    INSERT INTO posts (title, slug, content, author_id, status, excerpt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    input.title,
    slug,
    input.content,
    input.author_id,
    input.status || 'draft',
    input.excerpt || input.content.substring(0, 200)
  );

  return result.lastInsertRowid as number;
}

export function getPostById(id: number) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as
    | { id: number; title: string; content: string; author_id: number; status: string; slug: string }
    | undefined;
}

export function getPostBySlug(slug: string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as
    | { id: number; title: string; slug: string }
    | undefined;
}

export function updatePost(id: number, data: Partial<CreatePostInput>): boolean {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.title) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.content) {
    fields.push('content = ?');
    values.push(data.content);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;

  const result = db.prepare(sql).run(...values);
  return result.changes > 0;
}

export function deletePost(id: number): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function createUser(data: {
  username: string;
  email: string;
  password_hash: string;
  role?: string;
}): number {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(data.username, data.email, data.password_hash, data.role || 'user');

  return result.lastInsertRowid as number;
}

export function getUserByUsername(username: string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; email: string; role: string; password_hash: string }
    | undefined;
}

export function addTagToPost(postId: number, tagName: string): void {
  const db = getDatabase();

  // Create tag if doesn't exist
  let tagId: number;
  const existingTag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as { id?: number };

  if (existingTag?.id) {
    tagId = existingTag.id;
  } else {
    const tagSlug = generateSlug(tagName);
    const result = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run(tagName, tagSlug);
    tagId = result.lastInsertRowid as number;
  }

  // Link tag to post
  db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(postId, tagId);
}

export function clearTestData(): void {
  const db = getDatabase();
  db.exec('DELETE FROM post_tags');
  db.exec('DELETE FROM posts');
  db.exec('DELETE FROM tags');
  db.exec('DELETE FROM users');
}
