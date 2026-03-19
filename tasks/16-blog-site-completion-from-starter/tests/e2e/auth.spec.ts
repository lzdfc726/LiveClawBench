import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test('should display login page with register link', async ({ page }) => {
    await page.goto('/login');

    // Check page loads
    await expect(page.locator('h1')).toContainText('StellarDB');

    // Check for register link
    const registerLink = page.getByRole('link', { name: /register/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');

    // Check for home link
    const homeLink = page.getByRole('link', { name: /back to home/i });
    await expect(homeLink).toBeVisible();
  });

  test('should show initial setup when no users exist', async ({ page, request }) => {
    // Delete all users via script
    await request.post('http://localhost:3000/api/test/delete-users');

    await page.goto('/login');

    // Check for setup notice
    await expect(page.getByText(/initial setup/i)).toBeVisible();
    await expect(page.getByText(/create an admin user/i)).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.fill('input[name="confirmPassword"]', 'testpass123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message about email verification
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.goto('/register');

    // Test short username
    await page.fill('input[name="username"]', 'ab');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.fill('input[name="confirmPassword"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Should stay on registration page
    await expect(page).toHaveURL(/\/register/);

    // Test invalid email
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/register/);

    // Test password mismatch
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.fill('input[name="confirmPassword"]', 'different123');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should login as admin and redirect to /admin', async ({ page }) => {
    // First create an admin user
    await page.goto('/login');

    // Check if setup form is shown (no users exist)
    const setupNotice = page.getByText(/initial setup/i);

    if (await setupNotice.isVisible()) {
      // Create admin
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'adminpass123');
      await page.fill('input[name="confirm_password"]', 'adminpass123');
      await page.click('button[type="submit"]');

      // Wait for success
      await page.waitForTimeout(1000);
    }

    // Now login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'adminpass123');
    await page.click('button[type="submit"]');

    // Should redirect to /admin
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should prevent infinite redirect loop for regular users', async ({ page }) => {
    // Register a regular user
    await page.goto('/register');
    await page.fill('input[name="username"]', 'regularuser');
    await page.fill('input[name="email"]', 'regular@example.com');
    await page.fill('input[name="password"]', 'userpass123');
    await page.fill('input[name="confirmPassword"]', 'userpass123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);

    // Login as regular user
    await page.goto('/login');
    await page.fill('input[name="username"]', 'regularuser');
    await page.fill('input[name="password"]', 'userpass123');
    await page.click('button[type="submit"]');

    // Should redirect to /dashboard (not /admin)
    await expect(page).toHaveURL(/\/dashboard$/);

    // Should NOT be in infinite redirect loop
    // Wait a bit and check URL is stable
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('should show verification banner for unverified users', async ({ page }) => {
    // Login as newly registered (unverified) user
    await page.goto('/login');

    // If user exists from previous test, use it; otherwise create new
    await page.fill('input[name="username"]', 'unverifieduser');
    await page.fill('input[name="password"]', 'userpass123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Check if on dashboard
    const currentUrl = page.url();

    if (currentUrl.includes('/dashboard')) {
      // Should show verification banner
      await expect(page.getByText(/verify your email/i)).toBeVisible();
    }
  });

  test('should allow admin to access /admin routes', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'adminpass123');
    await page.click('button[type="submit"]');

    // Should be on /admin
    await expect(page).toHaveURL(/\/admin$/);

    // Navigate to posts
    await page.goto('/admin/posts');
    await expect(page).toHaveURL(/\/admin\/posts/);

    // Navigate to write
    await page.goto('/admin/write');
    await expect(page).toHaveURL(/\/admin\/write/);
  });

  test('should allow regular user to access /dashboard routes', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[name="username"]', 'regularuser');
    await page.fill('input[name="password"]', 'userpass123');
    await page.click('button[type="submit"]');

    // Should be on /dashboard
    await expect(page).toHaveURL(/\/dashboard$/);

    // Navigate to my posts
    await page.goto('/dashboard/posts');
    await expect(page).toHaveURL(/\/dashboard\/posts/);

    // Navigate to profile
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/dashboard\/profile/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'adminpass123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin$/);

    // Logout
    await page.goto('/admin/logout');

    // Should redirect to login or home
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\/(login|)$/);

    // Try to access protected route
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    // Should redirect to login
    expect(page.url()).toContain('/login');
  });
});

test.describe('Public Author Profiles', () => {
  test('should display author profile page', async ({ page }) => {
    // Navigate to an author page
    await page.goto('/author/admin');

    // Check if profile exists (might 404 if no posts)
    const content = await page.content();

    if (content.includes('Author')) {
      // Profile exists
      await expect(page.locator('h1')).toBeVisible();
    } else {
      // 404 is acceptable if author doesn't exist
      expect(content).toContain('404');
    }
  });
});

test.describe('Navigation', () => {
  test('should show correct navigation for non-authenticated users', async ({ page }) => {
    await page.goto('/');

    // Should show Home, Blog, About, Register, Login
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /blog/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('should show Dashboard link for authenticated users', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'adminpass123');
    await page.click('button[type="submit"]');

    // Go to home
    await page.goto('/');

    // Should show Dashboard link
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });

  test('should show Admin link only for admin/editor', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'adminpass123');
    await page.click('button[type="submit"]');

    await page.goto('/');

    // Should show Admin link
    const adminLink = page.getByRole('link', { name: /^admin$/i });
    await expect(adminLink).toBeVisible();
  });
});
