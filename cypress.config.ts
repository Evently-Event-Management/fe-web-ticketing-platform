import { defineConfig } from 'cypress';
const { devServer } = require('@cypress/webpack-dev-server');
const webpackConfig = require('./webpack.config.js');

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
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        webpackConfig,
      });
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './cypress/support/component.ts',
    indexHtmlFile: './cypress/support/component-index.html'
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true
});