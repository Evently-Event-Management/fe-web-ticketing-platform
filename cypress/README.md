# Cypress Testing for Ticketly

This project uses Cypress for end-to-end testing of the UI and user flows.

## Getting Started

### Running Tests

To run the Cypress tests, you can use the following npm scripts:

```bash
# Open Cypress in interactive mode
npm run cypress

# Run all tests headlessly
npm run cypress:run

# Run only e2e tests headlessly
npm run cypress:e2e
```

## Authentication Flow

All tests now start from a logged-out state and perform the login process:

1. Visit the home page
2. Click the login button
3. Handle cross-origin authentication using `cy.origin()`
4. Enter credentials (default: user@yopmail.com / user123)
5. Submit the login form
6. Navigate to the organizations page

### Handling Cross-Origin Authentication

The application uses an external authentication server at `http://auth.ticketly.com:8080`. To handle this cross-origin flow, we use Cypress's `cy.origin()` command:

```typescript
// Example of cross-origin authentication handling
cy.contains('button', 'Login').click();

// Handle cross-origin login at auth.ticketly.com
cy.origin('http://auth.ticketly.com:8080', () => {
  // Enter login credentials in the auth domain
  cy.get('#username').type('user@yopmail.com');
  cy.get('#password').type('user123');
  cy.get('#kc-login').click();
});
```

This approach ensures the tests accurately reflect the real user flow and prevents cross-origin errors.

## Test Structure

The tests are organized as follows:

- `cypress/e2e/auth/` - Tests for authentication flows
  - `login.cy.ts` - Tests for user login

- `cypress/e2e/organization/` - Tests for organization management
  - `create-organization.cy.ts` - Tests for creating organizations
  - `organization-page.cy.ts` - Tests for the organization list page
  - `recorded-flow.cy.ts` - Tests based on the recorded user flow
  - `organization-management-flow.cy.ts` - End-to-end organization lifecycle tests

## Mocking Authentication

The tests use a mock authentication system to simulate a logged-in user. This is implemented in:

```typescript
// In your test setup
cy.mockAuth(); // Sets up mocked authentication state
```

## Fixtures

Test data is stored in fixture files:

- `cypress/fixtures/organizations.json` - Contains organization data for tests

## Custom Commands

Several custom commands have been added to Cypress to make testing easier:

- `cy.mockAuth()` - Sets up authentication mocking

## Adding New Tests

When adding new tests:

1. Create a new file in the appropriate directory under `cypress/e2e/`
2. Use existing test patterns and fixtures where possible
3. Mock API responses to keep tests isolated
4. Add data to fixtures when appropriate

## Debugging Tests

To debug failing tests:

1. Check screenshots in `cypress/screenshots/` (generated on failures)
2. Check videos in `cypress/videos/` (if video recording is enabled)
3. Use `cy.log()` to add debug information
4. Run tests in interactive mode with `npm run cypress`