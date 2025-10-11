// cypress/e2e/organization/organization-navigation.cy.ts

describe('Organization Navigation Flow', () => {
  // Create a unique organization name for testing
  const timestamp = Date.now();
  const orgName = `Test Org ${timestamp}`;
  const orgWebsite = 'https://testorg.com';
  let orgId = '';
  
  before(() => {
    // Login and create a test organization
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Create the test organization
    cy.contains('button', 'Create Organization').click();
    cy.get('form').within(() => {
      cy.get('#name').type(orgName);
      cy.get('#website').type(orgWebsite);
      cy.contains('button', 'Save Organization').click();
    });
    
    // Verify creation and capture the organization ID from URL
    cy.contains(`Organization "${orgName}" created successfully`).should('be.visible');
    cy.contains(orgName).click();
    cy.url().then(url => {
      orgId = url.split('/').pop() || '';
    });
  });
  
  beforeEach(() => {
    cy.login();
  });
  
  it('should navigate through organization routes', () => {
    // Start at the organizations list
    cy.visit('/manage/organization/my-organizations');
    cy.contains('h1', 'Organizations').should('be.visible');
    
    // Navigate to organization details page
    cy.contains(orgName).click();
    cy.url().should('include', `/manage/organization/${orgId}`);
    cy.contains(orgName).should('be.visible');
    
    // Navigate to edit page
    cy.visit(`/manage/organization/${orgId}/edit`);
    cy.get('form').should('be.visible');
    cy.get('#name').should('have.value', orgName);
    
    // Navigate to staff page
    cy.visit(`/manage/organization/${orgId}/staff`);
    cy.contains('Staff Management').should('be.visible');
    
    // Navigate to seating page
    cy.visit(`/manage/organization/${orgId}/seating`);
    cy.contains('Seating Layouts').should('be.visible');
    
    // Verify we can navigate back to organization page from breadcrumb
    cy.contains('a', orgName).click();
    cy.url().should('include', `/manage/organization/${orgId}`);
  });
  
  // Clean up after tests
  after(() => {
    cy.login();
    cy.visit('/manage/organization/my-organizations');
    
    // Find and delete the test organization
    cy.get('body').then($body => {
      if ($body.text().includes(orgName)) {
        // Find the test organization row
        cy.contains('tr', orgName).find('button[aria-haspopup="menu"]').click({force: true});
        
        // Wait for dropdown to appear and click Delete
        cy.wait(300);
        cy.contains('Delete').click({force: true});
        
        // Confirm deletion in the dialog
        cy.wait(300);
        cy.contains('button', 'Delete').click({force: true});
        
        // Verify deletion
        cy.contains('Organization deleted successfully').should('exist');
      }
    });
  });
});