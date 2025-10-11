import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8090',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Handle cross-origin testing (for auth.ticketly.com)
    chromeWebSecurity: false,
    testIsolation: false
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true
});