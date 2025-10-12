# Ticketly Platform Testing Documentation

This document outlines the testing strategy, methodologies, and tools used in the Ticketly platform frontend application. It covers current testing practices and future plans for expanding test coverage.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Tools & Libraries](#testing-tools-libraries)
3. [Testing Types](#testing-types)
4. [E2E Testing with Cypress](#e2e-testing-with-cypress)
5. [Component Testing](#component-testing)
6. [Unit Testing with Jest](#unit-testing-with-jest)
7. [Continuous Integration](#continuous-integration)
8. [Test Recording & Replaying](#test-recording-replaying)
9. [Mock Services](#mock-services)
10. [Future Testing Plans](#future-testing-plans)
11. [Best Practices](#best-practices)

## Testing Overview

The Ticketly platform implements a multi-layered testing approach to ensure application reliability, functionality, and user experience. Our testing strategy follows the testing pyramid model:

- **Unit Tests**: Testing individual components and functions in isolation
- **Component Tests**: Testing React components in isolation
- **End-to-End Tests**: Testing complete user flows and interactions

Our primary focus has been on end-to-end testing with Cypress to validate critical user journeys.

## Testing Tools & Libraries

The project uses the following testing tools and libraries:

| Tool/Library | Version | Purpose |
|--------------|---------|---------|
| Cypress | ^15.4.0 | End-to-End testing and Component testing |
| Jest | ^30.2.0 | JavaScript testing framework |
| React Testing Library | ^16.3.0 | Component testing utilities |
| @testing-library/jest-dom | ^6.9.1 | Custom Jest matchers for DOM testing |
| @testing-library/user-event | ^14.6.1 | Simulate user events |
| @cypress/react | ^9.0.1 | React component testing with Cypress |
| @cypress/webpack-dev-server | ^5.1.3 | Development server for Cypress component tests |

## Testing Types

### E2E Testing with Cypress

End-to-End tests simulate user interactions with the application and verify that all components work together as expected. Our E2E tests focus on critical user flows such as:

- User authentication (login/logout)
- Organization management (creation, editing)
- (Planned) Event creation and management
- (Planned) Ticket purchasing and seat selection

#### Current E2E Test Coverage:

- **Authentication flows**
  - User login
  - Authentication token handling
  - Redirect logic

- **Organization Management**
  - Creating a new organization
  - Organization form validation
  - API interaction

#### Running E2E Tests

```bash
# Open Cypress test runner
npm run cypress

# Run all E2E tests headlessly
npm run cypress:e2e

# Run specific E2E tests
npx cypress run --spec "cypress/e2e/auth/*.cy.ts"
```

#### Configuration

E2E tests are configured in `cypress.config.ts` with the following key settings:

- Base URL: `http://localhost:8090`
- Chrome web security disabled for cross-origin testing (needed for Keycloak auth)
- Test isolation disabled to maintain state between tests when needed
- Viewport dimensions: 1280x720

### Component Testing

Component tests validate individual React components in isolation. This ensures that components render correctly and respond to user interactions as expected.

#### Component Test Configuration

Component tests are configured with:
- Custom webpack configuration for test environment
- React component testing setup
- Support files for mock data and providers

#### Running Component Tests

```bash
# Open Cypress component test runner
npx cypress open --component

# Run component tests headlessly
npx cypress run --component
```

### Unit Testing with Jest

Unit tests focus on testing individual functions and modules in isolation. Jest is configured to work with Next.js through `jest.config.js`.

#### Jest Configuration

Jest is set up with:
- Integration with Next.js
- JSDOM test environment
- Path aliases matching application imports
- Test path patterns that exclude Cypress tests

#### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific tests
npm test -- path/to/test
```

## Continuous Integration

The project uses GitHub Actions for continuous integration. On every pull request to the main branch, the following steps are performed:

- Code checkout
- Node.js setup (v20)
- Dependencies installation
- Application build

Current CI pipeline is focused on ensuring the build succeeds. Future improvements will include:

- Running automated tests as part of CI
- Code coverage reporting
- Performance testing
- Accessibility testing

## Test Recording & Replaying

Cypress has been configured to record test runs for debugging and analysis purposes. Recordings are stored in the `/recordings` directory and include:

- `create_organization_flow.json`: Records the organization creation flow
- `organization_crud.json`: Records organization CRUD operations

These recordings can be replayed to aid in debugging test failures and understanding user flows.

## Mock Services

The application uses mock services for testing to isolate components from external dependencies:

### Authentication Mocks

- `cypress/support/mocks/keycloak.ts`: Mocks the Keycloak authentication service
- `cypress/support/mocks/AuthProvider.tsx`: Mocks the auth provider context

### Organization Mocks

- `cypress/support/mocks/organization.ts`: Mocks organization API responses
- `cypress/support/mocks/OrganizationProvider.tsx`: Mocks the organization context provider

### Custom Commands

Custom Cypress commands have been created to simplify testing:

- `cy.login()`: Custom command for authentication
- `cy.cleanupTestOrganizations()`: Removes test organizations after tests

## Future Testing Plans

The testing strategy will be expanded to include:

### Additional E2E Test Scenarios

1. **Event Creation and Management**
   - Creating events with various configurations
   - Managing event details and settings
   - Publishing and unpublishing events

2. **Ticket Management**
   - Creating ticket types
   - Setting pricing and availability
   - Discount code application

3. **Seat Booking Flows**
   - Interactive seating map selection
   - Reserved seating flows
   - General admission flows

4. **Payment Processing**
   - Stripe payment integration testing
   - Order completion flows
   - Payment error handling

5. **User Account Management**
   - Account creation
   - Profile management
   - Preferences and settings

### Automated Visual Regression Testing

Implementing screenshot comparison testing to detect unintended visual changes in the UI.

### Accessibility Testing

Adding automated accessibility tests to ensure the application meets WCAG standards.

### Performance Testing

Implementing performance tests to monitor application load times and responsiveness.

### API Contract Testing

Adding tests to verify that frontend and backend API contracts remain compatible.

## Best Practices

The following testing best practices are encouraged:

1. **Write Tests First**: Adopt a test-driven development (TDD) approach when appropriate
2. **Meaningful Assertions**: Ensure tests verify meaningful behavior, not implementation details
3. **Stable Selectors**: Use data-testid attributes for test selection rather than CSS classes or element types
4. **Isolated Tests**: Each test should be independent and not rely on the state from previous tests
5. **Mock External Dependencies**: Use mocks for external services and APIs
6. **Keep Tests Fast**: Optimize tests for speed to encourage frequent running
7. **CI Integration**: All tests should run in CI to catch issues early
8. **Regular Maintenance**: Update tests as application code changes

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)