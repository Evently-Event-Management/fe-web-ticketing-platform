// cypress/e2e/organization/create-organization.cy.ts

describe('Organization Creation Flow', () => {
    const organizationName = `Test Org ${Date.now()}`;
    const organizationWebsite = 'https://testorg.com';

    beforeEach(() => {
        cy.login();
        cy.visit('/manage/organization/my-organizations');

        // Mock the initial API call to ensure the page starts empty
        cy.intercept('GET', '**/api/organizations', {
            statusCode: 200,
            body: []
        }).as('getOrganizations');
    });

    it('should create a new organization successfully', () => {
        // Click the Create Organization button
        cy.contains('button', 'Create Organization').click();

        // Dialog should be visible
        cy.get('form').within(() => {
            // Fill in the organization details
            cy.get('#name').type(organizationName);
            cy.get('#website').type(organizationWebsite);

            // Submit the form
            cy.contains('button', 'Save Organization').click();
        });

        // Assert that we show a success toast message
        cy.contains(`Organization "${organizationName}" created successfully!`).should('be.visible');

        // The dialog should be closed
        cy.get('form').should('not.exist');

        // The new organization should appear in the table
        cy.get('table').contains(organizationName).should('be.visible');
        cy.get('table').contains(organizationWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    });

    it('should validate required fields', () => {
        // Click the Create Organization button
        cy.contains('button', 'Create Organization').click();

        // Try to submit without a name
        cy.contains('button', 'Save Organization').click();

        // The form should still be open and show validation errors
        cy.get('form').should('be.visible');

        // Fill only the website and try again
        cy.get('#website').type(organizationWebsite);
        cy.contains('button', 'Save Organization').click();

        // The form should still be open
        cy.get('form').should('be.visible');

        // Now fill the required name field
        cy.get('#name').type(organizationName);
        cy.contains('button', 'Save Organization').click();

        // Now it should succeed
        cy.contains(`Organization "${organizationName}" created successfully!`).should('be.visible');
    });
});