# Playwright Testing Guide for Organization Management

This guide provides instructions for running and writing end-to-end tests for the organization management feature using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install @playwright/test --save-dev
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests
```bash
npm test
```

### Run with UI mode
```bash
npm run test:ui
```

### Run only E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test tests/e2e/organizations.spec.ts
```

## Test Structure

The tests are organized into the following files:

- `tests/e2e/organizations.spec.ts` - Tests for the Organizations page
- `tests/e2e/organization-dialogs.spec.ts` - Tests for the Create/Delete Organization dialogs
- `tests/e2e/data-table.spec.ts` - Tests for the DataTable component used in the Organizations page

## Mocking Authentication

The tests mock authentication by setting localStorage and sessionStorage values. This approach allows testing authenticated pages without going through the actual login flow.

```typescript
await page.evaluate(() => {
  localStorage.setItem('keycloak-token', 'mock-token');
  const mockUserData = {
    user_groups: ['/Permissions/Users/System Admins']
  };
  sessionStorage.setItem('keycloak-userinfo', JSON.stringify(mockUserData));
});
```

## Mocking API Responses

API responses are mocked using Playwright's route interception:

```typescript
await page.route('**/api/organizations**', route => {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([/* mock data */]),
  });
});
```

## Writing New Tests

When adding new tests:

1. Use the existing patterns in the e2e tests
2. Mock authentication when needed
3. Mock API responses for consistent test behavior
4. Consider using test.describe() and test.beforeEach() for setup
5. Test both happy paths and error conditions

## Debugging Tests

To debug tests visually:
```bash
npm run test:ui
```

For more verbose logs:
```bash
DEBUG=pw:api npx playwright test
```

## CI Integration

Add this to your CI workflow:

```yaml
- name: Install Playwright dependencies
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm test
```