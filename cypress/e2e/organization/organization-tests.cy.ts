// cypress/e2e/organization/organization-tests.cy.ts

describe('Organization Management', () => {
  // Generate unique organization names for each test run
  const timestamp = Date.now();
  const orgName = `Test Org ${timestamp}`;
  const updatedOrgName = `${orgName} Updated`;
  const orgWebsite = 'https://testorg.com';
  const updatedOrgWebsite = 'https://testorg-updated.com';
  
  beforeEach(() => {
    // Log in before each test
    cy.login();
    
    // Navigate to the organizations page
    cy.visit('/manage/organization/my-organizations');
    
    // Wait for page to load
    cy.contains('h1', 'Organizations').should('be.visible');
  });
  
  it('should perform full CRUD operations on organizations', () => {
    // ----- CREATE -----
    // Click the Create Organization button
    cy.contains('button', 'Create Organization').click();
    
    // Fill in the organization details in the dialog
    cy.get('form').within(() => {
      cy.get('#name').type(orgName);
      cy.get('#website').type(orgWebsite);
      cy.contains('button', 'Save Organization').click();
    });
    
    // Verify organization was created - use should('exist') for toast messages that might fade
    cy.contains(`Organization "${orgName}" created successfully`).should('exist');
    
    // Wait a moment for the table to update
    cy.wait(500);
    cy.get('table').contains(orgName).should('be.visible');
    
    // ----- READ -----
    // Click on the organization name to view details
    cy.contains('tr', orgName).find('.font-medium').click();
    
    // Verify we're on the organization details page
    cy.url().should('include', '/manage/organization/');
    cy.contains(orgName).should('be.visible');
    cy.contains(orgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // ----- UPDATE -----
    // Click the Edit button
    cy.contains('button', 'Edit').click();
    
    // Update the organization name and website
    cy.get('#name').clear().type(updatedOrgName);
    cy.get('#website').clear().type(updatedOrgWebsite);
    
    // Save the changes
    cy.contains('button', 'Save Changes').click();
    
    // Verify organization was updated
    cy.contains('Organization updated successfully').should('exist');
    cy.contains(updatedOrgName).should('be.visible');
    cy.contains(updatedOrgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // ----- DELETE -----
    // Go back to the organizations list
    cy.visit('/manage/organization/my-organizations');
    
    // Find the updated organization name in the table
    cy.contains('tr', updatedOrgName).should('be.visible');
    
    // Click the actions menu and select Delete
    cy.contains('tr', updatedOrgName).find('button[aria-haspopup="menu"]').click();
    
    // Make sure dropdown is open before clicking delete
    cy.get('[role="menu"]').should('be.visible');
    
    // Click the Delete option
    cy.contains('Delete').click({force: true});
    
    // Confirm deletion in the confirmation dialog
    cy.contains('Are you sure').should('be.visible');
    cy.contains('button', 'Delete').click();
    
    // Verify organization was deleted
    cy.contains('Organization deleted successfully').should('exist');
    
    // Wait for the table to update
    cy.wait(500);
    cy.contains(updatedOrgName).should('not.exist');
  });

  it('should validate required fields when creating organization', () => {
    // Click the Create Organization button
    cy.contains('button', 'Create Organization').click();

    // Try to submit without a name
    cy.contains('button', 'Save Organization').click();

    // The form should still be open and show validation errors
    cy.get('form').should('be.visible');

    // Fill only the website and try again
    cy.get('#website').type(orgWebsite);
    cy.contains('button', 'Save Organization').click();

    // The form should still be open
    cy.get('form').should('be.visible');

    // Now fill the required name field
    cy.get('#name').type(`${orgName}-validation`);
    cy.contains('button', 'Save Organization').click();

    // Now it should succeed
    cy.contains(`Organization "${orgName}-validation" created successfully`).should('exist');
    
    // Clean up: Delete the created organization
    cy.wait(500);
    cy.contains('tr', `${orgName}-validation`).find('button[aria-haspopup="menu"]').click();
    cy.contains('Delete').click({force: true});
    cy.contains('button', 'Delete').click();
    cy.contains('Organization deleted successfully').should('exist');
  });

  it('should handle API errors gracefully', () => {
    // Intercept the create organization API call and simulate an error
    cy.intercept('POST', '**/api/organizations', {
      statusCode: 500,
      body: { message: 'Server error occurred' }
    }).as('createOrgError');

    // Click the Create Organization button
    cy.contains('button', 'Create Organization').click();

    // Fill in the organization details
    cy.get('#name').type(`${orgName}-error-test`);
    cy.get('#website').type(orgWebsite);

    // Submit the form
    cy.contains('button', 'Save Organization').click();

    // Wait for the API call
    cy.wait('@createOrgError');

    // We should see an error toast
    cy.contains('Server error occurred').should('exist');

    // The form should still be open
    cy.get('form').should('be.visible');
  });
  
  // Clean up any remaining test organizations after all tests
  after(() => {
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Function to delete a test organization if found
    function deleteTestOrg() {
      return cy.get('body').then(($body) => {
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
          deleteTestOrg();
        });
      });
    }
    
    // Start the recursive deletion
    deleteTestOrg();
  });
});