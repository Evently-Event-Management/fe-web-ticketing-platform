# Event Testing

This directory contains end-to-end tests for event-related functionality using Cypress.

## Test Files

- `create-event.cy.ts`: Tests the full event creation flow

## Test Coverage

These tests cover:

1. Event creation workflow
   - Core details entry
   - Ticket tier setup
   - Session scheduling
   - Venue/location configuration
   - Capacity and seating setup
   - Final submission

## Mocks

The tests use several mock API responses to simulate backend behavior:

- Categories for dropdown selection
- Event creation API endpoints
- File upload endpoints for event images

## Custom Commands

Custom Cypress commands used in these tests:

- `login()`: Handles authentication
- `verifyToast()`: Verifies toast notifications with configurable timeouts
- `cleanupTestEvents()`: Removes test events after test completion

## Running Tests

```bash
# Run all event tests
npm run cypress:run -- --spec "cypress/e2e/events/**/*.cy.ts"

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/events/create-event.cy.ts"
```

## Future Tests

Additional tests planned for this area:

1. Event editing flow
2. Event cancellation
3. Event publishing/unpublishing
4. Multi-session event creation
5. Complex seating arrangements
6. Discount code creation and validation