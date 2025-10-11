// cypress/e2e/organization/organization-crud.cy.ts

describe('Organization CRUD Operations', () => {
  // Generate unique organization names for the test run
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
    
    // Verify organization was created
    // Use should('exist') instead of 'be.visible' for toast notifications that might disappear quickly
    cy.contains(`Organization "${orgName}" created successfully!`).should('exist');
    // Wait a moment for the table to update and show the new organization
    cy.wait(500);
    cy.get('table').contains(orgName).should('be.visible');
    
    // ----- READ -----
    // Click on the organization to view details
    cy.get('table').contains(orgName).click();
    
    // Verify we're on the organization details page
    cy.url().should('include', '/manage/organization/');
    cy.contains(orgName).should('be.visible');
    cy.contains(orgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // ----- UPDATE -----
    // Click the Edit button (in the table actions menu)
    cy.contains('button', 'Edit').click();
    
    // Update the organization name and website
    cy.get('#name').clear().type(updatedOrgName);
    cy.get('#website').clear().type(updatedOrgWebsite);
    
    // Save the changes
    cy.contains('button', 'Save Changes').click();
    
    // Verify organization was updated
    cy.contains('Organization updated successfully').should('be.visible');
    cy.contains(updatedOrgName).should('be.visible');
    cy.contains(updatedOrgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // ----- DELETE -----
    // Go back to the organizations list
    cy.visit('/manage/organization/my-organizations');
    
    // Find the updated organization name in the table
    cy.get('table').contains(updatedOrgName).should('be.visible');
    
    // Click the actions menu and select Delete
    cy.contains('tr', updatedOrgName).find('button[aria-haspopup="menu"]').click();
    cy.contains('Delete').click();
    
    // Confirm deletion in the confirmation dialog
    cy.contains('Are you sure').should('be.visible');
    cy.contains('button', 'Delete').click();
    
    // Verify organization was deleted
    cy.contains('Organization deleted successfully').should('be.visible');
    cy.contains(updatedOrgName).should('not.exist');
  });
  
  // Clean up any remaining test organizations after all tests
  after(() => {
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Look for any test organizations that weren't cleaned up
    const cleanupOrg = (attempt = 0) => {
      if (attempt >= 5) return; // Limit recursive attempts
      
      cy.get('body').then(($body) => {
        // Check if any test organizations exist
        const hasTestOrg = $body.text().includes('Test Org');
        
        if (hasTestOrg) {
          // Find and delete the first test organization
          cy.get('tr').contains('Test Org').closest('tr')
            .find('button[aria-haspopup="menu"]').click();
          
          cy.contains('Delete').click();
          cy.contains('button', 'Delete').click();
          
          // Wait for deletion and check again recursively
          cy.wait(1000);
          cleanupOrg(attempt + 1);
        }
      });
    };
    
    cleanupOrg();
  });
});