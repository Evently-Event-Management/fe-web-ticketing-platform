import { ProfileDetailsCard } from '@/app/manage/organization/[organization_id]/edit/_components/InfoCard';
import { mockOrganization } from '../../support/mocks/organization';
import * as OrganizationProvider from '@/providers/OrganizationProvider';

describe('ProfileDetailsCard Component', () => {
  beforeEach(() => {
    // Mock the useOrganization hook
    cy.stub(OrganizationProvider, 'useOrganization').returns({
      updateOrganization: cy.stub().resolves(mockOrganization),
    });
  });

  it('renders with organization details', () => {
    cy.mount(<ProfileDetailsCard organization={mockOrganization} />);
    
    cy.get('input#name').should('have.value', mockOrganization.name);
    cy.get('input#website').should('have.value', mockOrganization.website);
  });

  it('handles form submission with updated values', () => {
    const updateOrgStub = cy.stub().resolves(mockOrganization).as('updateOrgStub');
    
    cy.stub(OrganizationProvider, 'useOrganization').returns({
      updateOrganization: updateOrgStub,
    });

    cy.mount(<ProfileDetailsCard organization={mockOrganization} />);
    
    // Edit the form fields
    cy.get('input#name').clear().type('Updated Organization Name');
    cy.get('input#website').clear().type('https://updated-website.com');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if the update function was called with the right params
    cy.get('@updateOrgStub').should('be.calledWith', 
      mockOrganization.id, 
      { name: 'Updated Organization Name', website: 'https://updated-website.com' }
    );
  });

  it('disables submit button when name is empty', () => {
    cy.mount(<ProfileDetailsCard organization={mockOrganization} />);
    
    cy.get('input#name').clear();
    cy.get('button[type="submit"]').should('be.disabled');
    
    cy.get('input#name').type('Test');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});