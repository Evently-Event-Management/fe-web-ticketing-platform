import { DangerZoneCard } from '@/app/manage/organization/[organization_id]/edit/_components/DangerZoneCard';
import { mockOrganization } from '../../support/mocks/organization';
import * as OrganizationDialogModule from '@/components/OrganizationDialog';

describe('DangerZoneCard Component', () => {
  beforeEach(() => {
    // Mock the DeleteOrganizationDialog component
    cy.stub(OrganizationDialogModule, 'DeleteOrganizationDialog').callsFake(
      ({ organization, onDelete, children }) => (
        <div className="mock-delete-dialog" data-testid="mock-delete-dialog">
          <div className="mock-dialog-organization">{organization.name}</div>
          <button data-testid="trigger-button" onClick={onDelete}>
            {children}
          </button>
        </div>
      )
    );
  });

  it('renders the danger zone card with warning text', () => {
    cy.mount(<DangerZoneCard organization={mockOrganization} />);
    
    cy.contains('Danger Zone').should('be.visible');
    cy.contains('This action is permanent and cannot be undone').should('be.visible');
    cy.contains('Delete this organization and all its data').should('be.visible');
  });

  it('passes the organization to DeleteOrganizationDialog', () => {
    cy.mount(<DangerZoneCard organization={mockOrganization} />);
    
    cy.get('[data-testid="mock-delete-dialog"]').should('exist');
    cy.get('.mock-dialog-organization').contains(mockOrganization.name);
  });

  it('calls onDelete callback when deletion is triggered', () => {
    const onDeleteSpy = cy.stub().as('onDeleteSpy');
    cy.mount(<DangerZoneCard organization={mockOrganization} onDelete={onDeleteSpy} />);
    
    cy.get('[data-testid="trigger-button"]').click();
    cy.get('@onDeleteSpy').should('have.been.called');
  });
});