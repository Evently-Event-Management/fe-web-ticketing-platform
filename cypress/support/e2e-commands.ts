// cypress/support/e2e-commands.ts

// Add the custom command to Cypress's Chainable interface
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to log in through the UI.
             * @param email The user's email
             * @param password The user's password
             */
            login(email?: string, password?: string): Chainable<void>;
            
            /**
             * Custom command to clean up test organizations
             * Deletes any organizations with names containing "Test Org"
             */
            cleanupTestOrganizations(): Chainable<void>;
        }
    }
}

/**
 * Logs a user in through the UI by visiting the login page,
 * handling the cross-origin authentication with Keycloak.
 */
Cypress.Commands.add('login', (
    email = 'user@yopmail.com', // Default email
    password = 'user123'      // Default password
) => {
    // Start from the home page
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('/');


    // Set a larger viewport to ensure the login button is always visible
    cy.viewport(1200, 800);

    // Click the main login button on the home page
    cy.contains('Login').click();

    // Handle the cross-origin login flow at the Keycloak domain
    cy.origin('http://auth.ticketly.com:8080', { args: { email, password } }, ({ email, password }) => {
        // Now we are on the Keycloak page
        cy.get('#username').type(email);
        cy.get('#password').type(password, { log: false }); // {log: false} hides the password in Cypress logs
        cy.get('#kc-login').click();
    });

    // After login, we are redirected back to the app.
    // Verify that the login was successful by checking for an element that only logged-in users see.
    cy.url().should('not.include', '/auth');
    cy.contains('button', 'Create Events').should('be.visible');
});

/**
 * Custom command to clean up test organizations
 * Recursively deletes all organizations with names containing "Test Org"
 */
Cypress.Commands.add('cleanupTestOrganizations', () => {
    cy.visit('/manage/organization/my-organizations');
    
    // Function to delete a test organization if found
    function deleteNextTestOrg() {
        cy.get('body').then($body => {
            // If no more "Test Org" text, we're done
            if (!$body.text().includes('Test Org')) {
                return;
            }
            
            // Find a test organization row
            cy.get('tr').filter(':contains("Test Org")').first().then($row => {
                // Click the dropdown menu button
                cy.wrap($row).find('button[aria-haspopup="menu"]').click({force: true});
                
                // Wait for dropdown to appear and click Delete
                cy.wait(300);
                cy.contains('li', 'Delete').click({force: true});
                
                // Wait for confirmation dialog and click Delete
                cy.wait(300);
                cy.contains('button', 'Delete').click({force: true});
                
                // Wait for deletion and check for more test orgs
                cy.wait(1000);
                cy.reload();
                deleteNextTestOrg();
            });
        });
    }
    
    // Start the recursive deletion
    deleteNextTestOrg();
});

export { }; // Keep this line to make it a module