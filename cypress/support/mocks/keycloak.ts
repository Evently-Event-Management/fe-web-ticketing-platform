'use client';

// In our mock environment, we're mocking the entire keycloak.ts file
import Keycloak from 'keycloak-js';

// Mock keycloak environment variables
const keycloakUrl = 'https://mock.keycloak.url';
const keycloakRealm = 'mock-realm';
const keycloakClientId = 'mock-client-id';

// Create a mock Keycloak instance
const keycloakInstance = {
  init: cy.stub().resolves(true),
  login: cy.stub(),
  logout: cy.stub(),
  register: cy.stub(),
  accountManagement: cy.stub(),
  createLoginUrl: cy.stub().returns('http://mock-login-url'),
  createLogoutUrl: cy.stub().returns('http://mock-logout-url'),
  createRegisterUrl: cy.stub().returns('http://mock-register-url'),
  createAccountUrl: cy.stub().returns('http://mock-account-url'),
  isTokenExpired: cy.stub().returns(false),
  updateToken: cy.stub().resolves(true),
  clearToken: cy.stub(),
  hasRealmRole: cy.stub().returns(true),
  hasResourceRole: cy.stub().returns(true),
  loadUserProfile: cy.stub().resolves({
    id: 'mock-user-id',
    username: 'mock-user',
    email: 'mock-user@example.com',
    firstName: 'Mock',
    lastName: 'User'
  }),
  authenticated: true,
  token: 'mock-token',
  tokenParsed: {
    sub: 'mock-user-id',
    preferred_username: 'mock-user',
    email: 'mock-user@example.com',
    given_name: 'Mock',
    family_name: 'User',
    name: 'Mock User',
    realm_access: {
      roles: ['user', 'admin']
    },
    exp: 9999999999
  },
  refreshToken: 'mock-refresh-token',
  refreshTokenParsed: {
    exp: 9999999999
  },
  idToken: 'mock-id-token',
  idTokenParsed: {
    sub: 'mock-user-id'
  },
  subject: 'mock-user-id',
  realmAccess: {
    roles: ['user', 'admin']
  }
};

// Mock the Keycloak init function
export const initKeycloak = () => {
  return keycloakInstance;
};

export default keycloakInstance;