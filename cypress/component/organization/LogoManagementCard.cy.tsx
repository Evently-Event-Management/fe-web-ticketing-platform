import { LogoManagementCard } from '@/app/manage/organization/[organization_id]/edit/_components/LogoManagementCard';
import { mockOrganization, mockOrganizationNoLogo } from '../../support/mocks/organization';
import * as OrganizationProvider from '@/providers/OrganizationProvider';

describe('LogoManagementCard Component', () => {
  beforeEach(() => {
    // Mock the useOrganization hook
    cy.stub(OrganizationProvider, 'useOrganization').returns({
      uploadLogo: cy.stub().resolves(mockOrganization),
      removeLogo: cy.stub().resolves(),
    });
  });

  it('renders with organization logo', () => {
    cy.mount(<LogoManagementCard organization={mockOrganization} onUpdate={cy.stub()} />);
    
    cy.get('img[alt="Test Organization logo"]').should('be.visible');
    cy.contains('Upload Logo').should('not.exist');
    cy.contains('Change Logo').should('be.visible');
    cy.contains('Remove').should('be.visible');
  });

  it('renders without organization logo', () => {
    cy.mount(<LogoManagementCard organization={mockOrganizationNoLogo} onUpdate={cy.stub()} />);
    
    cy.get('img[alt="Test Organization No Logo logo"]').should('not.exist');
    cy.contains('Upload Logo').should('be.visible');
    cy.contains('Remove').should('not.exist');
  });

  it('handles logo upload when button is clicked', () => {
    const onUpdateSpy = cy.stub().as('onUpdateSpy');
    cy.mount(<LogoManagementCard organization={mockOrganizationNoLogo} onUpdate={onUpdateSpy} />);
    
    cy.get('input[type="file"]').should('exist');

    // We can't directly test file upload in component tests,
    // but we can verify the button triggers the click on the hidden input
    cy.contains('Upload Logo').click();
    cy.get('input[type="file"]').should('have.focus');
  });

  it('handles logo removal when button is clicked', () => {
    const onUpdateSpy = cy.stub().as('onUpdateSpy');
    const removeLogoStub = cy.stub().resolves().as('removeLogoStub');
    
    cy.stub(OrganizationProvider, 'useOrganization').returns({
      uploadLogo: cy.stub().resolves(mockOrganization),
      removeLogo: removeLogoStub,
    });

    cy.mount(<LogoManagementCard organization={mockOrganization} onUpdate={onUpdateSpy} />);
    
    cy.contains('Remove').click();
    
    // Verify the stub was called with the correct organization ID
    cy.get('@removeLogoStub').should('be.calledWith', mockOrganization.id);
  });
});