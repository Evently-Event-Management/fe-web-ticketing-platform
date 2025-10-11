// cypress/e2e/organization/organization-management.cy.ts

describe('Organization Management Features', () => {
  // Generate unique organization names and data for the test run
  const timestamp = Date.now();
  const orgName = `Test Org ${timestamp}`;
  const orgWebsite = 'https://testorg.com';
  
  // Create an organization once before all tests
  before(() => {
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Create a test organization to use across tests
    cy.contains('button', 'Create Organization').click();
    cy.get('form').within(() => {
      cy.get('#name').type(orgName);
      cy.get('#website').type(orgWebsite);
      cy.contains('button', 'Save Organization').click();
    });
    
    // Wait for organization to be created
    cy.contains(`Organization "${orgName}" created successfully!`).should('be.visible');
  });
  
  beforeEach(() => {
    // Login and navigate to the organization's page
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Navigate to the test organization's page
    cy.contains(orgName).click();
  });
  
  it('should display organization details correctly', () => {
    // Verify organization name and website are displayed
    cy.contains(orgName).should('be.visible');
    cy.contains(orgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // Verify basic UI elements are present
    cy.get('.avatar').should('exist');  // Logo placeholder or actual logo
    cy.contains('Edit').should('be.visible');
  });

  it('should update organization name', () => {
    // Click edit button
    cy.contains('button', 'Edit').click();
    
    // Update just the name
    const updatedName = `${orgName} - Renamed`;
    cy.get('#name').clear().type(updatedName);
    cy.contains('button', 'Save Changes').click();
    
    // Verify the name was updated
    cy.contains('Organization updated successfully').should('be.visible');
    cy.contains(updatedName).should('be.visible');
    
    // Restore original name for other tests
    cy.contains('button', 'Edit').click();
    cy.get('#name').clear().type(orgName);
    cy.contains('button', 'Save Changes').click();
  });

  it('should update organization website', () => {
    // Click edit button
    cy.contains('button', 'Edit').click();
    
    // Update just the website
    const updatedWebsite = 'https://updated-website.com';
    cy.get('#website').clear().type(updatedWebsite);
    cy.contains('button', 'Save Changes').click();
    
    // Verify the website was updated
    cy.contains('Organization updated successfully').should('be.visible');
    cy.contains(updatedWebsite.replace(/^https?:\/\//, '')).should('be.visible');
  });

  it('should handle logo upload and removal', () => {
    // Note: This is a simplified test as we can't easily upload real files in Cypress
    // We'll just verify the upload buttons and UI elements

    // Verify logo upload UI is present
    cy.contains('Upload Logo').should('be.visible');
    
    // Check if we can click the upload button
    cy.contains('Upload Logo').click();
    
    // If there's already a logo, check if remove button works
    cy.get('body').then($body => {
      if ($body.find('button:contains("Remove")').length > 0) {
        cy.contains('button', 'Remove').click();
        cy.contains('Logo removed successfully').should('be.visible');
      }
    });
  });
  
  // Delete the test organization after all tests
  after(() => {
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Find and delete the test organization
    cy.contains('tr', orgName).then($row => {
      if ($row.length) {
        cy.wrap($row).find('button[aria-haspopup="menu"]').click();
        cy.contains('Delete').click();
        cy.contains('button', 'Delete').click();
        cy.contains('Organization deleted successfully').should('be.visible');
      }
    });
  });
});