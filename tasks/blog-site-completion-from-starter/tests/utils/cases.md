# Stellar-DB Blog System Test Cases

**Version:** 1.0
**Last Updated:** 2026-03-18
**Test Framework:** Playwright/Vitest compatible
**Alignment:** Project Milestones M1-M5

---

## Overview

This document contains 19 comprehensive test cases for the Stellar-DB blog system, organized by the implementation milestones defined in the project requirements. Each test case includes testable assertions suitable for automated verification.

---

## Milestone 1: System Core (M1)

*Ubuntu environment hardening, Node.js installation, Astro project initialization with SQLite connectivity*

### TC-01: Application Startup & Database Initialization
**Priority:** Critical | **Type:** Integration

| Field | Description |
|-------|-------------|
| **Objective** | Verify Astro server starts and SQLite database initializes correctly |
| **Preconditions** | Clean `data/` directory or non-existent database file |
| **Steps** | 1. Run `npm run dev`<br>2. Check stdout for startup messages<br>3. Verify `data/stellar.db` is created |
| **Expected Result** | Server on port 3000, database file created with all tables (posts, users, tags, etc.) |
| **Auto Verification** | HTTP GET `http://localhost:3000/` returns 200; `SELECT name FROM sqlite_master WHERE type='table'` returns expected tables |

---

### TC-02: Database Schema Integrity
**Priority:** Critical | **Type:** Unit/Integration

| Field | Description |
|-------|-------------|
| **Objective** | Verify all required tables and foreign key constraints exist |
| **Preconditions** | Application running, database initialized |
| **Steps** | 1. Query SQLite for table list<br>2. Verify column types and constraints<br>3. Test FTS5 virtual table exists |
| **Expected Result** | Tables: posts, users, tags, post_tags, sessions, page_views, media, comments, settings, posts_fts |
| **Auto Verification** | `PRAGMA table_info(posts)` returns expected columns; `SELECT * FROM posts_fts LIMIT 1` does not error |

---

### TC-03: Environment Configuration Loading
**Priority:** High | **Type:** Unit

| Field | Description |
|-------|-------------|
| **Objective** | Verify `.env` variables load correctly into application |
| **Preconditions** | `.env` file exists with JWT_SECRET and DATABASE_URL |
| **Steps** | 1. Start application with test environment variables<br>2. Verify JWT token generation uses correct secret<br>3. Check database path respects config |
| **Expected Result** | JWT tokens signed with configured secret; database at configured path |
| **Auto Verification** | Decode JWT header.payload matches JWT_SECRET from env; `getDatabase()` returns instance at correct path |

---

## Milestone 2: Schema & Content (M2)

*Designing the relational schema; implementing basic Post/Tag/Category CRUD operations with author ownership*

### TC-04: Create Post with Author Association
**Priority:** Critical | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify posts are created with correct author_id foreign key |
| **Preconditions** | Authenticated user session (id=1, username="alice") |
| **Steps** | 1. POST to `/dashboard/write` with title="Test", content="Body"<br>2. Query database for new post<br>3. Verify author association |
| **Expected Result** | Post created with `author_id=1`, slug auto-generated from title |
| **Auto Verification** | `SELECT author_id FROM posts WHERE title='Test'` returns 1; `SELECT slug FROM posts WHERE title='Test'` is not null |

---

### TC-05: Slug Generation and Uniqueness
**Priority:** High | **Type:** Unit

| Field | Description |
|-------|-------------|
| **Objective** | Verify slugs are URL-safe and handle collisions |
| **Preconditions** | Post with slug "hello-world" exists |
| **Steps** | 1. Create post with title "Hello World"<br>2. Create second post with same title<br>3. Verify collision handling |
| **Expected Result** | First slug: "hello-world"; Second slug: "hello-world-1" |
| **Auto Verification** | `SELECT slug FROM posts WHERE title='Hello World' ORDER BY id` returns unique slugs with suffix |

---

### TC-06: Post CRUD Operations
**Priority:** Critical | **Type:** E2E/API

| Field | Description |
|-------|-------------|
| **Objective** | Verify full CRUD lifecycle for posts |
| **Preconditions** | Authenticated user, no existing posts |
| **Steps** | 1. **Create**: POST `/dashboard/write` → verify in DB<br>2. **Read**: GET `/blog/{slug}` → verify 200<br>3. **Update**: POST `/dashboard/posts/{id}/edit` → verify changes<br>4. **Delete**: POST `/dashboard/posts/{id}/delete` → verify removal |
| **Expected Result** | All operations succeed, database reflects final state correctly |
| **Auto Verification** | Post count before=0, after create=1, after delete=0; HTTP codes: 302, 200, 302, 302 |

---

### TC-07: Tag Association and Junction Table
**Priority:** Medium | **Type:** Integration

| Field | Description |
|-------|-------------|
| **Objective** | Verify posts can have multiple tags via junction table |
| **Preconditions** | Tags "javascript", "web" exist in database |
| **Steps** | 1. Create post with tags ["javascript", "web"]<br>2. Query post_tags junction table<br>3. Verify tag retrieval |
| **Expected Result** | Two entries in post_tags linking post_id to tag_ids |
| **Auto Verification** | `SELECT COUNT(*) FROM post_tags WHERE post_id=X` returns 2; `SELECT t.name FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=X` returns ["javascript", "web"] |

---

## Milestone 3: Secure Authentication (M3)

*JWT-based authentication system with role-based access control (admin/editor/user)*

### TC-08: JWT Token Generation and Validation
**Priority:** Critical | **Type:** Unit

| Field | Description |
|-------|-------------|
| **Objective** | Verify JWT tokens contain correct payload and validate |
| **Preconditions** | User exists with role="user" |
| **Steps** | 1. Call login function with valid credentials<br>2. Verify token structure (header.payload.signature)<br>3. Decode and verify payload contains id, username, role, exp |
| **Expected Result** | Valid JWT with 7-day expiry, contains user id, username, role |
| **Auto Verification** | `jwt.verify(token, JWT_SECRET)` succeeds; payload.exp - payload.iat ≈ 604800 seconds |

---

### TC-09: Role-Based Route Protection
**Priority:** Critical | **Type:** E2E/API

| Field | Description |
|-------|-------------|
| **Objective** | Verify routes enforce role-based access |
| **Preconditions** | Users exist: admin(role="admin"), editor(role="editor"), user(role="user") |
| **Steps** | 1. Access `/admin/settings` as user → expect redirect<br>2. Access `/admin/settings` as editor → expect redirect<br>3. Access `/admin/settings` as admin → expect 200 |
| **Expected Result** | User/Editor redirected to dashboard; Admin granted access |
| **Auto Verification** | User/Editor: HTTP 302 to `/dashboard`; Admin: HTTP 200, page contains settings form |

---

### TC-10: Ownership-Based Edit Permissions
**Priority:** Critical | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Users can only edit their own posts; Editors/Admins can edit any |
| **Preconditions** | Post by User A (id=1); Test users: User A, User B, Editor, Admin |
| **Steps** | 1. User A edits own post → expect success<br>2. User B edits User A's post → expect denial<br>3. Editor edits User A's post → expect success<br>4. Admin edits User A's post → expect success |
| **Expected Result** | Permission checks respect ownership and role hierarchy |
| **Auto Verification** | Success: HTTP 302 + DB updated; Denial: HTTP 302 to `/dashboard/posts`, DB unchanged |

---

### TC-11: Session Expiration
**Priority:** High | **Type:** Integration

| Field | Description |
|-------|-------------|
| **Objective** | Verify expired JWT tokens are rejected |
| **Preconditions** | User has valid session |
| **Steps** | 1. Create token with short expiry (1 second)<br>2. Wait 2 seconds<br>3. Attempt authenticated request |
| **Expected Result** | Token rejected, user redirected to login |
| **Auto Verification** | `checkAuth(Astro)` returns null; HTTP 302 to `/login` |

---

### TC-12: Password Hashing (bcrypt)
**Priority:** Critical | **Type:** Security/Unit

| Field | Description |
|-------|-------------|
| **Objective** | Verify passwords are never stored in plaintext |
| **Preconditions** | User registered with password "secret123" |
| **Steps** | 1. Query users table for password_hash<br>2. Verify bcrypt hash format<br>3. Attempt to verify password against hash |
| **Expected Result** | Password stored as bcrypt hash (format: `$2b$10$...`); verification function returns true for correct password |
| **Auto Verification** | `SELECT password_hash FROM users WHERE username='test'` returns string starting with `$2b$`; `bcrypt.compareSync('secret123', hash)` returns true |

---

## Milestone 4: User Dashboard (M4)

*Separate `/dashboard` for users to manage their own content; profile management with bio, avatar, and website*

### TC-13: Dashboard Post Listing - Ownership Filter
**Priority:** High | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Dashboard shows only current user's posts |
| **Preconditions** | User Alice has 3 posts; User Bob has 2 posts |
| **Steps** | 1. Login as Alice<br>2. Navigate to `/dashboard/posts`<br>3. Count visible posts |
| **Expected Result** | Alice sees 3 posts; no posts by Bob visible |
| **Auto Verification** | Page contains "3 posts"; post titles match `SELECT title FROM posts WHERE author_id=alice_id` |

---

### TC-14: Profile Update - All Fields
**Priority:** Medium | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify profile form updates display_name, bio, avatar, website |
| **Preconditions** | Authenticated user with existing profile |
| **Steps** | 1. Navigate to `/dashboard/profile`<br>2. Update display_name="Jane Doe"<br>3. Update bio="Developer"<br>4. Update avatar="https://example.com/avatar.jpg"<br>5. Update website="https://jane.dev"<br>6. Submit form |
| **Expected Result** | All fields persisted to database |
| **Auto Verification** | `SELECT display_name, bio, avatar, website FROM users WHERE id=X` matches submitted values; success message displayed |

---

### TC-15: Public Author Profile Page
**Priority:** Medium | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify `/author/{username}` displays profile and posts |
| **Preconditions** | User "charlie" with bio, avatar, and 2 published posts |
| **Steps** | 1. Visit `/author/charlie` as unauthenticated user<br>2. Verify profile info visible<br>3. Verify only published posts listed |
| **Expected Result** | Bio, avatar displayed; only published posts shown in list |
| **Auto Verification** | Page contains charlie's bio, avatar image src correct; post count on page = `SELECT COUNT(*) FROM posts WHERE author_id=X AND status='published'` |

---

### TC-16: Draft vs Published Status Visibility
**Priority:** High | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Draft posts visible in dashboard but not public blog |
| **Preconditions** | User has 1 draft, 1 published post |
| **Steps** | 1. As author, check `/dashboard/posts` → see both<br>2. As visitor, check `/blog` → see only published<br>3. Direct access to `/blog/{draft-slug}` → expect 404 |
| **Expected Result** | Draft filtered from public; accessible in dashboard |
| **Auto Verification** | Dashboard shows 2 posts; blog index shows 1; direct draft access returns 404 or redirect |

---

## Milestone 5: Search & UX (M5)

*Implementing SQLite FTS5 (Full-Text Search), RSS feeds, and dynamic SEO metadata*

### TC-17: FTS5 Full-Text Search Functionality
**Priority:** High | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify search returns relevant results ranked by relevance |
| **Preconditions** | Posts exist with content: "JavaScript tutorial", "Python guide", "JavaScript best practices" |
| **Steps** | 1. Navigate to `/search?q=javascript`<br>2. Observe results<br>3. Verify only published posts returned |
| **Expected Result** | Two results containing "javascript"; "Python guide" not in results |
| **Auto Verification** | Search results page contains two post titles; `SELECT * FROM posts_fts WHERE posts_fts MATCH 'javascript'` matches returned results |

---

### TC-18: Search Empty State
**Priority:** Low | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify appropriate message when no search results |
| **Preconditions** | No posts contain "xyzqwerty12345" |
| **Steps** | 1. Search for non-matching query "xyzqwerty12345" |
| **Expected Result** | Page displays "No results found" or similar message |
| **Auto Verification** | Page contains text matching `/no results|not found|empty/i`; result count = 0 |

---

### TC-19: SEO Meta Tags Generation
**Priority:** Medium | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify dynamic meta tags for posts (title, description, OG tags) |
| **Preconditions** | Published post with title "Learn Astro" and excerpt exists |
| **Steps** | 1. Visit `/blog/learn-astro`<br>2. View page source<br>3. Check meta tags |
| **Expected Result** | `<title>` contains post title; `<meta name="description">` contains excerpt; OG tags present |
| **Auto Verification** | Response body contains: `<title>.*Learn Astro.*</title>`, `<meta.*description.*>`, `<meta.*og:title.*>` |

---

### TC-20: RSS Feed Generation
**Priority:** Medium | **Type:** E2E/API

| Field | Description |
|-------|-------------|
| **Objective** | Verify RSS feed contains published posts in valid XML format |
| **Preconditions** | 2+ published posts exist with titles, slugs, and published_at dates |
| **Steps** | 1. Navigate to `/rss.xml` or `/feed.xml`<br>2. Verify valid RSS/XML structure<br>3. Check all published posts included |
| **Expected Result** | Valid XML with `<channel>`, `<item>` elements; post titles and links correct; sorted by published date |
| **Auto Verification** | Content-Type is `application/rss+xml` or `application/xml`; XML parses without errors; item count = `SELECT COUNT(*) FROM posts WHERE status='published'`; contains `<title>`, `<link>`, `<pubDate>` for each post |

---

## Edge Case Tests

### TC-21: Registration Password Validation
**Priority:** High | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify password strength requirements are enforced |
| **Preconditions** | On registration page |
| **Steps** | 1. Try register with password "123" (too short)<br>2. Try register with password "password" (no number)<br>3. Try register with valid "Password123" |
| **Expected Result** | Short/weak passwords rejected with error; 8+ char password accepted |
| **Auto Verification** | Weak passwords: page shows error, no DB entry; Valid password: redirect to login |

---

### TC-22: Duplicate Username Registration
**Priority:** High | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Prevent duplicate username registration |
| **Preconditions** | User "alice" already exists |
| **Steps** | 1. Navigate to `/register`<br>2. Enter username "alice", new email<br>3. Submit form |
| **Expected Result** | Error message: "Username already taken" |
| **Auto Verification** | HTTP 200, error text visible; `SELECT COUNT(*) FROM users WHERE username='alice'` returns 1 |

---

### TC-23: Archive Post Status
**Priority:** Medium | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify archived posts are hidden from public but visible to author |
| **Preconditions** | Post exists with status="archived" |
| **Steps** | 1. Author views `/dashboard/posts` → sees archived post<br>2. Visitor views `/blog` → does not see archived post<br>3. Direct access to slug → 404 |
| **Expected Result** | Archived posts hidden from public, accessible in dashboard |
| **Auto Verification** | Dashboard count includes archived; blog index excludes; direct access returns 404 |

---

### TC-24: Delete Permission Enforcement
**Priority:** Critical | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify users can only delete their own posts |
| **Preconditions** | Post by User A; User B logged in |
| **Steps** | 1. User B attempts POST to `/dashboard/posts/{userA_post_id}/delete`<br>2. Verify post still exists |
| **Expected Result** | Forbidden/redirected, post remains in database |
| **Auto Verification** | HTTP 302 to `/dashboard/posts`; `SELECT id FROM posts WHERE id=X` still returns row |

---

### TC-25: Settings Persistence
**Priority:** Medium | **Type:** E2E

| Field | Description |
|-------|-------------|
| **Objective** | Verify blog settings (title, description) persist and display correctly |
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Navigate to `/admin/settings`<br>2. Change blog title to "My Blog"<br>3. Change description to "A great blog"<br>4. Save<br>5. Visit homepage |
| **Expected Result** | Settings saved to DB; homepage shows new title in header and footer |
| **Auto Verification** | `SELECT value FROM settings WHERE key='blog_title'` returns "My Blog"; page contains "My Blog" in `<title>` and footer |

---

## Test Implementation Examples

### Playwright E2E Test (TC-04 Example)

```typescript
// tests/e2e/m2-content.spec.ts
import { test, expect } from '@playwright/test';

test.describe('M2: Schema & Content', () => {
  test('TC-04: Create Post with Author Association', async ({ page, request }) => {
    // Login as alice
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Create post
    await page.goto('/dashboard/write');
    await page.fill('input[name="title"]', 'TC04 Test Post');
    await page.fill('textarea[name="content"]', 'Test content body');
    await page.selectOption('select[name="status"]', 'published');
    await page.click('button[type="submit"]');

    // Verify redirect and success
    await expect(page).toHaveURL('/dashboard/posts');
    await expect(page.locator('.alert-success')).toContainText('created');

    // Database verification (via API or direct query in CI)
    const response = await request.get('/api/debug/post?title=TC04%20Test%20Post');
    const post = await response.json();
    expect(post.author_id).toBe(1); // alice's ID
    expect(post.slug).toBe('tc04-test-post');
  });
});
```

### Vitest Unit Test (TC-08 Example)

```typescript
// tests/unit/m3-auth.spec.ts
import { describe, it, expect } from 'vitest';
import { login, generateToken, verifyToken } from '../../src/lib/auth';

describe('M3: Secure Authentication', () => {
  it('TC-08: JWT Token Generation and Validation', () => {
    const user = { id: 1, username: 'test', role: 'user' };
    const token = generateToken(user);

    // Verify structure
    expect(token.split('.')).toHaveLength(3);

    // Verify payload
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    expect(payload.id).toBe(1);
    expect(payload.username).toBe('test');
    expect(payload.role).toBe('user');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    // Verify can be decoded with secret
    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified.username).toBe('test');
  });
});
```

### API Integration Test (TC-10 Example)

```typescript
// tests/api/m3-permissions.spec.ts
import { test, expect } from '@playwright/test';

test.describe('M3: RBAC Permissions', () => {
  test('TC-10: Ownership-Based Edit Permissions', async ({ browser }) => {
    // Create contexts for different users
    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();
    const adminContext = await browser.newContext();

    // Login each user... (setup code)
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();
    const adminPage = await adminContext.newPage();

    // Alice creates a post
    await alicePage.goto('/dashboard/write');
    await alicePage.fill('input[name="title"]', 'TC10 Test Post');
    await alicePage.fill('textarea[name="content"]', 'Content');
    await alicePage.click('button[type="submit"]');

    // Get post ID from URL
    await alicePage.goto('/dashboard/posts');
    const postRow = await alicePage.locator('.post-card:has-text("TC10")');
    const editLink = await postRow.locator('a:has-text("Edit")').getAttribute('href');
    const postId = editLink.match(/\/(\d+)\/edit/)[1];

    // Bob (another user) tries to edit - should be denied
    const bobResponse = await bobPage.goto(`/dashboard/posts/${postId}/edit`);
    expect(bobResponse?.url()).toContain('/dashboard/posts'); // Redirected

    // Admin can edit - should succeed
    const adminResponse = await adminPage.goto(`/dashboard/posts/${postId}/edit`);
    expect(adminResponse?.status()).toBe(200);
    await expect(adminPage.locator('input[name="title"]')).toHaveValue('TC10 Test Post');
  });
});
```

---

## Test Data Requirements

### Required Test Users

| Username | Role | Password | Display Name |
|----------|------|----------|--------------|
| admin | admin | AdminPass123 | System Admin |
| editor | editor | EditorPass123 | Content Editor |
| alice | user | UserPass123 | Alice Smith |
| bob | user | UserPass123 | Bob Johnson |
| charlie | user | UserPass123 | Charlie Davis |

### Required Test Posts

| Title | Author | Status | Tags | Excerpt |
|-------|--------|--------|------|---------|
| Getting Started with Astro | alice | published | javascript, web | Learn Astro basics |
| Draft Ideas | alice | draft | ideas | Work in progress |
| JavaScript Best Practices | bob | published | javascript | Tips for JS devs |
| Python Guide | bob | published | python | Python tutorial |
| Web Development 101 | charlie | published | javascript, web, html | Introduction to web |
| Private Thoughts | charlie | draft | personal | Not ready to share |

---

## Coverage Matrix

| Milestone | TC Count | Unit Tests | E2E Tests | API Tests |
|-----------|----------|------------|-----------|-----------|
| M1: System Core | 3 | 2 | 1 | 0 |
| M2: Schema & Content | 4 | 2 | 4 | 2 |
| M3: Secure Authentication | 5 | 3 | 4 | 5 |
| M4: User Dashboard | 4 | 1 | 4 | 2 |
| M5: Search & UX | 4 | 0 | 4 | 2 |
| Edge Cases | 5 | 0 | 5 | 2 |
| **Total** | **25** | **8** | **22** | **13** |

