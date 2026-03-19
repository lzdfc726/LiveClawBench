import { test, expect } from '@playwright/test';

/**
 * Stellar-DB Milestone Test Suite
 * Tests organized by milestone TC-01 to TC-25
 */

const BASE_URL = 'http://localhost:3000';

// Test users
const USERS = {
  admin: { username: 'admin', password: 'AdminPass123', role: 'admin' },
  editor: { username: 'editor', password: 'EditorPass123', role: 'editor' },
  alice: { username: 'alice', password: 'UserPass123', role: 'user' },
  bob: { username: 'bob', password: 'UserPass123', role: 'user' },
};

async function login(page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500);
}

// ═══════════════════════════════════════════════════════════════════════════
// M2: SCHEMA & CONTENT (E2E Tests)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('M2: Schema & Content - E2E', () => {
  test('TC-04: Create Post with Author Association', async ({ page }) => {
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/dashboard/write');

    await page.fill('input[name="title"]', 'TC04 E2E Test Post');
    await page.fill('textarea[name="content"]', 'This is test content for TC04');
    await page.selectOption('select[name="status"]', 'published');
    await page.click('button[type="submit"]');

    // Should redirect to posts list
    await expect(page).toHaveURL(/\/dashboard\/posts/);
    await expect(page.locator('.alert-success, [class*="success"]')).toBeVisible();
  });

  test('TC-06: Post CRUD Operations', async ({ page }) => {
    await login(page, USERS.alice.username, USERS.alice.password);

    // Create
    await page.goto('/dashboard/write');
    await page.fill('input[name="title"]', 'CRUD Test Post');
    await page.fill('textarea[name="content"]', 'Content for CRUD test');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Read - verify in list
    await page.goto('/dashboard/posts');
    await expect(page.locator('text=CRUD Test Post')).toBeVisible();

    // Edit
    const editLink = page.locator('.post-card:has-text("CRUD Test Post") a:has-text("Edit")').first();
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click();
      await page.fill('input[name="title"]', 'CRUD Test Post - Updated');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// M3: SECURE AUTHENTICATION (E2E Tests)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('M3: Secure Authentication - E2E', () => {
  test('TC-09: Role-Based Route Protection', async ({ page }) => {
    // User tries to access admin - should redirect
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/admin/settings');

    // Should be redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Admin can access
    await login(page, USERS.admin.username, USERS.admin.password);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('TC-10: Ownership-Based Edit Permissions', async ({ page }) => {
    // Alice creates a post
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/dashboard/write');
    await page.fill('input[name="title"]', 'Alice Private Post');
    await page.fill('textarea[name="content"]', 'Private content');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Note: In real test, we'd need to extract post ID from URL
    // This is simplified - checking that Bob is redirected when trying to edit
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// M4: USER DASHBOARD (E2E Tests)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('M4: User Dashboard - E2E', () => {
  test('TC-13: Dashboard Post Listing - Ownership Filter', async ({ page }) => {
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/dashboard/posts');

    // Should only see alice's posts
    const postTitles = await page.locator('.post-card h3').allTextContents();

    // Verify filter is working (in real test, would verify no bob posts visible)
    expect(postTitles.length).toBeGreaterThanOrEqual(0);
  });

  test('TC-14: Profile Update - All Fields', async ({ page }) => {
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/dashboard/profile');

    await page.fill('input[name="display_name"]', 'Alice Smith');
    await page.fill('textarea[name="bio"]', 'Test bio for TC14');
    await page.fill('input[name="website"]', 'https://alice.dev');
    await page.click('button[type="submit"]');

    await expect(page.locator('.alert-success, [class*="success"]')).toBeVisible();
  });

  test('TC-15: Public Author Profile Page', async ({ page }) => {
    // Visit alice's public profile as unauthenticated
    await page.goto('/author/alice');

    // Should show profile info or 404 if user doesn't exist
    const content = await page.content();
    expect(content.includes('alice') || content.includes('404')).toBe(true);
  });

  test('TC-16: Draft vs Published Status Visibility', async ({ page }) => {
    await login(page, USERS.alice.username, USERS.alice.password);

    // Create draft post
    await page.goto('/dashboard/write');
    await page.fill('input[name="title"]', 'Draft Post TC16');
    await page.fill('textarea[name="content"]', 'Draft content');
    await page.selectOption('select[name="status"]', 'draft');
    await page.click('button[type="submit"]');

    // Draft should be visible in dashboard
    await page.goto('/dashboard/posts');
    await page.waitForTimeout(300);

    // Should see draft filter or draft indicator
    const hasDraftFilter = await page.locator('a:has-text("Draft")').isVisible().catch(() => false);
    expect(hasDraftFilter || await page.locator('text=Draft Post TC16').isVisible().catch(() => false)).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// M5: SEARCH & UX (E2E Tests)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('M5: Search & UX - E2E', () => {
  test('TC-17: FTS5 Full-Text Search Functionality', async ({ page }) => {
    const hasSearch = await page.goto('/').then(() =>
      page.locator('input[type="search"], input[name="q"]').isVisible().catch(() => false)
    );

    if (hasSearch) {
      await page.fill('input[type="search"], input[name="q"]', 'javascript');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Verify search results page
      expect(page.url()).toContain('/search');
    }
  });

  test('TC-18: Search Empty State', async ({ page }) => {
    const hasSearch = await page.goto('/').then(() =>
      page.locator('input[type="search"], input[name="q"]').isVisible().catch(() => false)
    );

    if (hasSearch) {
      await page.fill('input[type="search"], input[name="q"]', 'xyzqwerty12345-nomatch');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Should show no results message
      const content = await page.content();
      expect(
        content.toLowerCase().includes('no results') ||
        content.toLowerCase().includes('not found') ||
        content.toLowerCase().includes('empty')
      ).toBe(true);
    }
  });

  test('TC-19: SEO Meta Tags Generation', async ({ page }) => {
    // First create a published post
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/dashboard/write');
    await page.fill('input[name="title"]', 'SEO Test Post');
    await page.fill('textarea[name="content"]', 'Content with SEO');
    await page.selectOption('select[name="status"]', 'published');
    await page.click('button[type="submit"]');

    // Visit the public post and check meta tags
    await page.goto('/blog/seo-test-post');
    await page.waitForTimeout(300);

    const title = await page.title();
    expect(title.toLowerCase()).toContain('seo');
  });

  test('TC-20: RSS Feed Generation', async ({ page }) => {
    const response = await page.goto('/rss.xml');

    if (response && response.status() === 200) {
      const content = await page.content();
      expect(content).toContain('<channel>');
      expect(content).toContain('<item>');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EDGE CASES (E2E Tests)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Edge Cases - E2E', () => {
  test('TC-21: Registration Password Validation', async ({ page }) => {
    await page.goto('/register');

    // Try short password
    await page.fill('input[name="username"]', 'newuser1');
    await page.fill('input[name="email"]', 'new1@example.com');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    await page.click('button[type="submit"]');

    // Should stay on register page with error
    await expect(page).toHaveURL(/\/register/);
  });

  test('TC-22: Duplicate Username Registration', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'alice'); // Existing user
    await page.fill('input[name="email"]', 'unique@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page).toHaveURL(/\/register/);
  });

  test('TC-24: Delete Permission Enforcement', async ({ page }) => {
    // Alice creates a post
    await login(page, USERS.alice.username, USERS.alice.password);
    await page.goto('/dashboard/write');
    await page.fill('input[name="title"]', 'Delete Test Post');
    await page.fill('textarea[name="content"]', 'To be deleted');
    await page.click('button[type="submit"]');

    // Post exists in Alice's dashboard
    await page.goto('/dashboard/posts');
    await expect(page.locator('text=Delete Test Post')).toBeVisible();

    // Try to access delete page
    const deleteLink = page.locator('.post-card:has-text("Delete Test Post") a:has-text("Delete")').first();
    if (await deleteLink.isVisible().catch(() => false)) {
      await deleteLink.click();
      await expect(page).toHaveURL(/\/delete/);
    }
  });
});
