# Stellar-DB Test Suite - Quick Reference

## 🚀 Quick Commands

```bash
# View test mapping
npm run test:map

# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all

# Generate coverage report
npm run test:report

# View coverage in browser
npm run test:coverage
```

## 📁 Test File Locations

| Milestone | Test File | Test Cases |
|-----------|-----------|------------|
| M1 | `tests/m1-system-core/m1-system-core.test.ts` | TC-01, TC-02, TC-03 |
| M2 | `tests/m2-schema-content/m2-schema-content.test.ts` | TC-04, TC-05, TC-06 |
| M2 | `tests/m2-schema-content/m2-integration.test.ts` | TC-07 |
| M3 | `tests/m3-auth/m3-auth.test.ts` | TC-08 to TC-12 |
| M4 | `tests/m4-dashboard/m4-dashboard.test.ts` | TC-13 to TC-16 |
| M5 | `tests/m5-search-ux/m5-search.test.ts` | TC-17, TC-19, TC-20 |
| Edge | `tests/edge-cases/edge-cases.test.ts` | TC-21 to TC-25 |
| E2E | `tests/e2e/milestones.spec.ts` | Multiple TCs |
| E2E | `tests/e2e/auth.spec.ts` | Auth flows |

## 🧪 Test Structure

```
tests/
├── e2e/                    # E2E tests (Playwright)
├── m1-system-core/         # Database & schema tests
├── m2-schema-content/      # CRUD & tag tests
├── m3-auth/                # Authentication tests
├── m4-dashboard/           # Dashboard & profile tests
├── m5-search-ux/           # Search & SEO tests
├── edge-cases/             # Edge case tests
└── utils/                  # Test helpers
```

## 📊 Coverage Status

✅ **25/25 Test Cases Implemented (100%)**

- M1: System Core - 3/3 ✅
- M2: Schema & Content - 4/4 ✅
- M3: Authentication - 5/5 ✅
- M4: Dashboard - 4/4 ✅
- M5: Search & UX - 4/4 ✅
- Edge Cases - 5/5 ✅

## 🔧 Test Utilities

### Create Test Data
```typescript
import { createUser, createPost, clearTestData } from './utils';

// Create user
const userId = createUser({
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hash123'
});

// Create post
const postId = createPost({
  title: 'Test Post',
  content: 'Content',
  author_id: userId
});

// Clean up
clearTestData();
```

### Auth Helpers
```typescript
import { generateToken, verifyToken, hashPassword } from './utils/auth-helpers';

// Generate token
const token = generateToken({ id: 1, username: 'user', role: 'user' });

// Verify token
const decoded = verifyToken(token);

// Hash password
const hash = await hashPassword('password123');
```

## 🎯 Test Case Mapping

### M1: System Core
- **TC-01**: Database initialization
- **TC-02**: Schema integrity
- **TC-03**: Environment config

### M2: Schema & Content
- **TC-04**: Post creation with author
- **TC-05**: Slug generation
- **TC-06**: CRUD operations
- **TC-07**: Tag associations

### M3: Authentication
- **TC-08**: JWT tokens
- **TC-09**: Role-based access
- **TC-10**: Edit permissions
- **TC-11**: Session expiration
- **TC-12**: Password hashing

### M4: Dashboard
- **TC-13**: Post ownership filter
- **TC-14**: Profile updates
- **TC-15**: Author profiles
- **TC-16**: Draft visibility

### M5: Search & UX
- **TC-17**: FTS5 search
- **TC-18**: Empty search
- **TC-19**: SEO meta tags
- **TC-20**: RSS feeds

### Edge Cases
- **TC-21**: Password validation
- **TC-22**: Duplicate usernames
- **TC-23**: Archived posts
- **TC-24**: Delete permissions
- **TC-25**: Settings persistence

## 🐛 Troubleshooting

### Tests failing?
1. Clear test databases: `rm data/test-*.db`
2. Check environment variables
3. Ensure dependencies installed: `npm install`

### E2E tests timeout?
1. Start dev server: `npm run dev`
2. Check port 3000 is available
3. Increase timeout in `playwright.config.ts`

### Database locked?
1. Close existing connections
2. Delete test databases
3. Restart tests

## 📖 Documentation

- [Full README](./tests/README.md)
- [Test Coverage Report](./tests/test-coverage-report.md)
- [Implementation Summary](./TEST-IMPLEMENTATION-SUMMARY.md)
- [Test Cases Spec](./STELLAR-DB-TEST-CASES.md)

## 🎓 Best Practices

1. **Always clean up** - Use `clearTestData()` in `beforeEach()`
2. **Be specific** - Use precise assertions
3. **Test behavior** - Focus on what, not how
4. **Document** - Add comments for complex tests
5. **Isolate** - Tests shouldn't depend on each other

## 📈 Continuous Integration

```yaml
# Example CI pipeline
- npm install
- npm run test
- npm run test:e2e
- npm run test:coverage
```

---

**Need help?** Check `tests/README.md` for detailed documentation.
