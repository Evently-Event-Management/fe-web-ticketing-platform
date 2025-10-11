// cypress/e2e/organization/recorded-flow-simplified.cy.ts

describe('Organization Recorded Flow (Simplified)', () => {
  // Use a consistent name for the test organization
  const orgName = `Test Org ${Date.now()}`;
  const updatedOrgName = `${orgName} renamed`;
  const orgWebsite = 'https://testorg.com';
  const updatedOrgWebsite = 'https://testorg-link-renamed.com';
  
  it('should follow the recorded organization flow', () => {
    // ----- LOGIN & NAVIGATION -----
    cy.login();
    
    // Navigate to "Create Events" then "My Organizations"
    cy.contains('button', 'Create Events').click();
    cy.contains('My Organizations').click();
    
    // ----- CREATE ORGANIZATION -----
    cy.contains('button', 'Create Organization').click();
    
    // Fill in organization details
    cy.get('#name').type(orgName);
    cy.get('#website').type(orgWebsite);
    
    // Save the organization
    cy.contains('button', 'Save Organization').click();
    
    // Verify the organization was created (toast message may fade, so use 'exist' not 'be.visible')
    cy.contains(`Organization "${orgName}" created successfully`).should('exist');
    
    // Verify organization appears in table
    cy.wait(500); // Wait for table to update
    cy.contains('tr', orgName).should('be.visible');
    
    // ----- EDIT ORGANIZATION -----
    // Find and click the organization name
    cy.contains('tr', orgName).find('.font-medium').click();
    
    // Click the edit button
    cy.contains('button', 'Edit').click();
    
    // Update the name
    cy.get('#name').clear().type(updatedOrgName);
    cy.contains('button', 'Save Changes').click();
    
    // Verify name update
    cy.contains('Organization updated successfully').should('exist');
    cy.contains(updatedOrgName).should('be.visible');
    
    // Edit again to update website
    cy.contains('button', 'Edit').click();
    cy.get('#website').clear().type(updatedOrgWebsite);
    cy.contains('button', 'Save Changes').click();
    
    // Verify website update
    cy.contains('Organization updated successfully').should('exist');
    cy.contains(updatedOrgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // ----- DELETE ORGANIZATION -----
    // Go back to organizations list
    cy.visit('/manage/organization/my-organizations');
    
    // Find organization and click the actions menu
    cy.contains('tr', updatedOrgName).find('button[aria-haspopup="menu"]').click();
    
    // Click Delete option (using force true as it might be in a dropdown)
    cy.wait(300); // Wait for dropdown to fully appear
    cy.contains('Delete').click({force: true});
    
    // Confirm deletion
    cy.contains('Are you sure').should('be.visible');
    cy.contains('button', 'Delete').click();
    
    // Verify organization was deleted
    cy.contains('Organization deleted successfully').should('exist');
    cy.wait(500); // Wait for table to update
    cy.contains(updatedOrgName).should('not.exist');
  });
});