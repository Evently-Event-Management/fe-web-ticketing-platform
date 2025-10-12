// cypress/e2e/auth/login.cy.ts

describe('User Login', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();

        // Set up mocks for login endpoints
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'mock-jwt-token',
                refreshToken: 'mock-refresh-token',
                user: {
                    id: 'test-user-id',
                    name: 'Test User',
                    email: 'user@yopmail.com',
                    roles: ['user']
                }
            }
        }).as('loginRequest');

        // Set viewport to a larger size to ensure the Login button is visible
        // (Button has className="hidden lg:inline-flex")
        cy.viewport(1200, 800);

        // Visit the home page
        cy.visit('/');
    });

    it('should successfully log in with valid credentials', () => {
        // Clear any existing session state
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.reload();
        
        // Set viewport to a larger size to ensure the Login button is visible
        // (Button has className="hidden lg:inline-flex")
        cy.viewport(1200, 800);

        // Click the login button - looking for it directly without the 'button' selector constraint
        cy.contains('Login').click();

        // Handle cross-origin login at auth.ticketly.com
        cy.origin('http://auth.ticketly.com:8080', () => {
            // Fill in the login form
            cy.get('#username').type('user@yopmail.com');
            cy.get('#password').type('user123');

            // Submit the form
            cy.get('#kc-login').click();
        });

        // Verify successful login (user is redirected to dashboard)
        cy.url().should('include', '/');

        // Verify navigation elements that should be visible after login
        cy.contains('button', 'Create Events').should('be.visible');
    });

    it('should handle login errors', () => {
        // Note: For cross-origin tests, we can't easily mock error responses on the auth server
        // This test demonstrates the structure, but in practice requires additional configuration

        // Clear any existing session state
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.reload();
        
        // Set viewport to a larger size to ensure the Login button is visible
        cy.viewport(1200, 800);

        // Click the login button - looking for it directly without the 'button' selector constraint
        cy.contains('Login').click();

        // Handle cross-origin login at auth.ticketly.com with error case
        cy.origin('http://auth.ticketly.com:8080', () => {
            // Fill in the login form with incorrect credentials
            cy.get('#username').type('wrong@yopmail.com');
            cy.get('#password').type('wrongpass');

            // Submit the form
            cy.get('#kc-login').click();

            // Check for error message on the auth page
            cy.contains('Invalid username or password').should('be.visible');
        });

        // After returning to the main app, verify we're still on the login page
        // or check another sign that login failed (depends on your app behavior)
        cy.url().should('include', '/auth'); // Or another URL indicating failed login
    });

    it('should navigate to the organization page after login', () => {
        // Mock organizations endpoint
        cy.intercept('GET', '**/api/**/organizations/my', {
            statusCode: 200,
            body: []
        }).as('getOrganizations');


        // Clear any existing session state
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.reload();

        // Set viewport to a larger size to ensure the Login button is visible
        cy.viewport(1200, 800);

        // Click the login button - looking for it directly without the 'button' selector constraint
        cy.contains('Login').click();

        // Handle cross-origin login at auth.ticketly.com
        cy.origin('http://auth.ticketly.com:8080', () => {
            // Fill in the login form
            cy.get('#username').type('user@yopmail.com');
            cy.get('#password').type('user123');

            // Submit the form
            cy.get('#kc-login').click();
        });

        // Navigate to Create Events
        cy.contains('button', 'Create Events').click();

        // Wait for the organizations to load
        cy.wait('@getOrganizations');

        // Navigate to My Organizations
        cy.contains('My Organizations').click();

        // Verify we're on the organizations page
        cy.url().should('include', '/manage/organization');
        cy.contains('h1', 'Organizations').should('be.visible');
    });
});