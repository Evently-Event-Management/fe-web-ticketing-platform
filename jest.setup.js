// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the environment variables
process.env.NEXT_PUBLIC_KEYCLOAK_URL = 'http://mock-keycloak-url';
process.env.NEXT_PUBLIC_KEYCLOAK_REALM = 'mock-realm';
process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID = 'mock-client-id';

// Mock the matchMedia function which is not available in Jest environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({ organization_id: 'test-org-id' }),
  usePathname: () => '/mock-path',
}));