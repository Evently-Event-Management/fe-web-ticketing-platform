// cypress/e2e/organization/create-organization.cy.ts

describe('Organization Creation Flow', () => {
    const organizationName = `Test Org ${Date.now()}`;
    const organizationWebsite = 'https://testorg.com';

    beforeEach(() => {
        cy.login();
        cy.visit('/manage/organization/my-organizations');

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
        cy.verifyToast(`Organization "${organizationName}" created successfully!`);

        // The dialog should be closed
        cy.get('form').should('not.exist');

        // The new organization should appear in the table
        cy.get('table').contains(organizationName).should('be.visible');
        cy.get('table').contains(organizationWebsite.replace(/^https?:\/\//, '')).should('be.visible');
        
        // Clean up: Delete the created organization
        // Click on the three dots (More actions) for this organization
        cy.get('table').contains(organizationName).closest('tr').find('button[aria-haspopup="menu"]').click();
        
        // Click on the Delete option in the dropdown menu
        cy.contains('Delete').click();
        
        // Type the organization name to confirm deletion
        cy.get('#org-name').type(organizationName);
        
        // Click the delete button
        cy.contains('button', 'I understand, delete this organization').click();
        
        // Verify the toast appears using our custom command
        cy.verifyToast(`Organization "${organizationName}" has been deleted.`);
        
        // Wait for UI to update and the organization to be removed from the table
        cy.wait(1000);
        
        // Verify the organization is no longer in the table
        cy.contains(organizationName).should('not.exist');
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
        cy.verifyToast(`Organization "${organizationName}" created successfully!`);
        
        // Clean up: Delete the created organization
        // Click on the three dots (More actions) for this organization
        cy.get('table').contains(organizationName).closest('tr').find('button[aria-haspopup="menu"]').click();
        
        // Click on the Delete option in the dropdown menu
        cy.contains('Delete').click();
        
        // Type the organization name to confirm deletion
        cy.get('#org-name').type(organizationName);
        
        // Click the delete button
        cy.contains('button', 'I understand, delete this organization').click();
        
        // Verify the toast appears using our custom command
        cy.verifyToast(`Organization "${organizationName}" has been deleted.`);
        
        // Wait for UI to update and the organization to be removed from the table
        cy.wait(1000);
        
        // Verify the organization is no longer in the table
        cy.contains(organizationName).should('not.exist');
    });
});