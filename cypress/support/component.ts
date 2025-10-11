// ***********************************************************
// This is a support file for component testing
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// We're not importing global styles directly as they may cause issues
// with the Next.js-specific CSS setup

// Import component testing commands
import { mount } from 'cypress/react';

// Add the mount command
Cypress.Commands.add('mount', mount);

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}