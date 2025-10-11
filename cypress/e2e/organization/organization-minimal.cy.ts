// cypress/e2e/organization/organization-minimal.cy.ts

describe('Organization CRUD Operations (Minimal)', () => {
  // Generate unique organization names
  const timestamp = Date.now();
  const orgName = `Test Org ${timestamp}`;
  const orgWebsite = 'https://testorg.com';
  
  beforeEach(() => {
    // Login and go to organizations page
    cy.login();
    cy.visit('/manage/organization/my-organizations');
  });
  
  it('should perform organization CRUD operations', () => {
    // ------ CREATE ------
    // Click Create Organization button
    cy.contains('button', 'Create Organization').click();
    
    // Fill form and submit
    cy.get('#name').type(orgName);
    cy.get('#website').type(orgWebsite);
    cy.contains('button', 'Save Organization').click();
    
    // Verify creation (toast may fade quickly)
    cy.contains(`Organization "${orgName}" created`).should('exist');
    cy.wait(500);
    
    // ------ READ ------
    // Find organization in table and click to view
    cy.contains(orgName).click();
    
    // Verify details page shows correct info
    cy.contains(orgName).should('be.visible');
    cy.contains(orgWebsite.replace(/^https?:\/\//, '')).should('be.visible');
    
    // ------ UPDATE ------
    // Click Edit button
    cy.contains('button', 'Edit').click();
    
    // Update name and save
    const updatedName = `${orgName} Updated`;
    cy.get('#name').clear().type(updatedName);
    cy.contains('button', 'Save Changes').click();
    
    // Verify update
    cy.contains('Organization updated').should('exist');
    cy.contains(updatedName).should('be.visible');
    
    // ------ DELETE ------
    // Go back to organizations list
    cy.visit('/manage/organization/my-organizations');
    
    // Open dropdown menu and delete
    cy.contains('tr', updatedName).find('button[aria-haspopup="menu"]').click();
    cy.wait(300);
    cy.contains('Delete').click({force: true});
    cy.contains('button', 'Delete').click();
    
    // Verify deletion
    cy.contains('Organization deleted').should('exist');
    cy.wait(500);
    cy.contains(updatedName).should('not.exist');
  });
  
  // Clean up any leftover test organizations
  after(() => {
    cy.login();
    cy.cleanupTestOrganizations();
  });
});