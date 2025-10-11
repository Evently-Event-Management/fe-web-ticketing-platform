/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to mock authentication
     */
    mockAuth(): Chainable<void>;
  }
}

// Add this to help TypeScript understand cy.origin
declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Execute commands in the context of a different origin
     * @param url - The URL or domain of the remote origin
     * @param fn - Callback function with commands to execute in the remote origin
     * @param options - Optional configuration
     */
    origin(
      url: string,
      fn: () => void,
      options?: { args?: any }
    ): Chainable<Subject>;
  }
}