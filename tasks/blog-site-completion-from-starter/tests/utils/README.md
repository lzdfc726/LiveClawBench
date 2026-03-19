# Stellar-DB Test Suite

Comprehensive test suite for the Stellar-DB blog system, implementing all 25 test cases from `STELLAR-DB-TEST-CASES.md`.

## Test Structure

```
tests/
├── e2e/                          # End-to-End Tests (Playwright)
│   ├── auth.spec.ts             # Authentication flow tests
│   └── milestones.spec.ts       # Milestone-based E2E tests
│
├── m1-system-core/              # Milestone 1: System Core
│   └── m1-system-core.test.ts   # Database initialization & schema tests
│
├── m2-schema-content/           # Milestone 2: Schema & Content
│   ├── m2-schema-content.test.ts    # Post CRUD tests
│   └── m2-integration.test.ts       # Tag association tests
│
├── m3-auth/                     # Milestone 3: Authentication
│   └── m3-auth.test.ts          # JWT, RBAC, password tests
│
├── m4-dashboard/                # Milestone 4: User Dashboard
│   └── m4-dashboard.test.ts     # Dashboard & profile tests
│
├── m5-search-ux/                # Milestone 5: Search & UX
│   └── m5-search.test.ts        # FTS5, RSS, SEO tests
│
├── edge-cases/                  # Edge Case Tests
│   └── edge-cases.test.ts       # Validation & permission tests
│
├── utils/                       # Test Utilities
│   ├── index.ts                 # Common test helpers
│   └── auth-helpers.ts          # Authentication helpers
│
├── test-runner.mjs              # Comprehensive test runner
├── run-tests.ts                 # Legacy test runner
└── test-coverage-report.md      # Coverage report
```

## Test Coverage

All 25 test cases from `STELLAR-DB-TEST-CASES.md` are implemented:

- ✅ **M1: System Core** (3/3 tests - 100%)
  - TC-01: Application Startup & Database Initialization
  - TC-02: Database Schema Integrity
  - TC-03: Environment Configuration Loading

- ✅ **M2: Schema & Content** (4/4 tests - 100%)
  - TC-04: Create Post with Author Association
  - TC-05: Slug Generation and Uniqueness
  - TC-06: Post CRUD Operations
  - TC-07: Tag Association and Junction Table

- ✅ **M3: Secure Authentication** (5/5 tests - 100%)
  - TC-08: JWT Token Generation and Validation
  - TC-09: Role-Based Route Protection
  - TC-10: Ownership-Based Edit Permissions
  - TC-11: Session Expiration
  - TC-12: Password Hashing (bcrypt)

- ✅ **M4: User Dashboard** (4/4 tests - 100%)
  - TC-13: Dashboard Post Listing - Ownership Filter
  - TC-14: Profile Update - All Fields
  - TC-15: Public Author Profile Page
  - TC-16: Draft vs Published Status Visibility

- ✅ **M5: Search & UX** (4/4 tests - 100%)
  - TC-17: FTS5 Full-Text Search Functionality
  - TC-18: Search Empty State
  - TC-19: SEO Meta Tags Generation
  - TC-20: RSS Feed Generation

- ✅ **Edge Cases** (5/5 tests - 100%)
  - TC-21: Registration Password Validation
  - TC-22: Duplicate Username Registration
  - TC-23: Archive Post Status
  - TC-24: Delete Permission Enforcement
  - TC-25: Settings Persistence

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# Run comprehensive test suite
node tests/test-runner.mjs --all

# Run with verbose output
node tests/test-runner.mjs --all --verbose
```

### Run Specific Test Types

```bash
# Unit & Integration Tests (Vitest)
npm test
# or
npx vitest run

# Watch mode
npx vitest

# With coverage
npm run test:coverage

# E2E Tests (Playwright)
npx playwright test

# Run specific test file
npx vitest run tests/m3-auth/m3-auth.test.ts
npx playwright test tests/e2e/auth.spec.ts
```

### Test Runner Options

```bash
node tests/test-runner.mjs --all          # Run all tests
node tests/test-runner.mjs --unit         # Run unit tests only
node tests/test-runner.mjs --e2e          # Run E2E tests only
node tests/test-runner.mjs --map          # Show test case mapping
node tests/test-runner.mjs --report       # Generate coverage report
node tests/test-runner.mjs --verbose      # Verbose output
```

## Test Frameworks

- **Vitest**: Unit and integration tests
- **Playwright**: End-to-end tests
- **better-sqlite3**: In-memory database testing

## Test Utilities

### Database Helpers

```typescript
import { createPost, createUser, getPostById } from './utils';

// Create test user
const userId = createUser({
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hash123'
});

// Create test post
const postId = createPost({
  title: 'Test Post',
  content: 'Content',
  author_id: userId,
  status: 'published'
});

// Clean up test data
clearTestData();
```

### Auth Helpers

```typescript
import { generateToken, verifyToken, hashPassword } from './utils/auth-helpers';

// Generate JWT
const token = generateToken({ id: 1, username: 'alice', role: 'user' });

// Verify token
const decoded = verifyToken(token);

// Hash password
const hash = await hashPassword('password123');
```

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../../src/lib/database';
import { clearTestData } from '../utils';

describe('Feature Name', () => {
  beforeEach(() => {
    clearTestData();
  });

  it('should do something', () => {
    const db = getDatabase();
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should perform user action', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Test Database

Tests use separate database files:
- Production: `data/stellar.db`
- Unit tests: `data/test-*.db` (temporary, cleaned up after tests)
- E2E tests: Use the production database on test server

## Continuous Integration

Tests are designed to run in CI environments:

```yaml
# Example GitHub Actions
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npx playwright test
```

## Best Practices

1. **Isolation**: Each test clears data with `clearTestData()`
2. **Descriptive Names**: Test names describe the expected behavior
3. **Assertions**: Use specific, meaningful assertions
4. **Cleanup**: Always clean up test data
5. **Coverage**: Maintain 100% test case coverage

## Troubleshooting

### Tests Failing

1. Check database is properly initialized
2. Ensure environment variables are set
3. Verify test database is not locked
4. Clear old test databases: `rm data/test-*.db`

### E2E Tests Timing Out

1. Increase timeout in `playwright.config.ts`
2. Ensure dev server is running
3. Check for port conflicts

### Database Errors

1. Foreign key constraints: Ensure referenced entities exist
2. Unique constraints: Clear data between tests
3. Database locked: Close existing connections

## Test Reports

Generate detailed reports:

```bash
# Coverage report
npm run test:coverage

# HTML coverage report
npm run test:coverage
open coverage/index.html

# Test case mapping
node tests/test-runner.mjs --map > test-mapping.txt
```

## Related Documentation

- [Test Cases Specification](../STELLAR-DB-TEST-CASES.md)
- [Test Coverage Report](./test-coverage-report.md)
- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
