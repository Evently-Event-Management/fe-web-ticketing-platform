import { CreateOrganizationDialog, DeleteOrganizationDialog } from '@/components/OrganizationDialog';
import { mockOrganization } from '../../support/mocks/organization';
import * as OrganizationProvider from '@/providers/OrganizationProvider';

describe('OrganizationDialog Components', () => {
  describe('CreateOrganizationDialog', () => {
    beforeEach(() => {
      // Mock the useOrganization hook
      cy.stub(OrganizationProvider, 'useOrganization').returns({
        createOrganization: cy.stub().resolves(mockOrganization),
      });
    });

    it('renders the dialog trigger', () => {
      cy.mount(
        <CreateOrganizationDialog>
          <button>Open Create Dialog</button>
        </CreateOrganizationDialog>
      );
      
      cy.contains('Open Create Dialog').should('be.visible');
    });

    it('opens the dialog when trigger is clicked', () => {
      cy.mount(
        <CreateOrganizationDialog>
          <button>Open Create Dialog</button>
        </CreateOrganizationDialog>
      );
      
      cy.contains('Open Create Dialog').click();
      cy.contains('Create New Organization').should('be.visible');
      cy.get('input#name').should('be.visible');
      cy.get('input#website').should('be.visible');
    });

    it('submits the form with valid data', () => {
      const createOrgStub = cy.stub().resolves(mockOrganization);
      cy.stub(OrganizationProvider, 'useOrganization').returns({
        createOrganization: createOrgStub,
      });

      const onCreateSpy = cy.stub();
      cy.mount(
        <CreateOrganizationDialog onCreate={onCreateSpy}>
          <button>Open Create Dialog</button>
        </CreateOrganizationDialog>
      );
      
      cy.contains('Open Create Dialog').click();
      cy.get('input#name').type('New Test Organization');
      cy.get('input#website').type('https://new-test.com');
      cy.contains('Save Organization').click();
      
      // Verify the create function was called with correct data
      cy.wrap(createOrgStub).should('be.calledWith', { 
        name: 'New Test Organization', 
        website: 'https://new-test.com' 
      });
    });
  });

  describe('DeleteOrganizationDialog', () => {
    beforeEach(() => {
      // Mock the useOrganization hook
      cy.stub(OrganizationProvider, 'useOrganization').returns({
        deleteOrganization: cy.stub().resolves(),
      });
    });

    it('renders the dialog trigger', () => {
      cy.mount(
        <DeleteOrganizationDialog organization={mockOrganization}>
          <button>Delete Organization</button>
        </DeleteOrganizationDialog>
      );
      
      cy.contains('Delete Organization').should('be.visible');
    });

    it('opens the dialog when trigger is clicked', () => {
      cy.mount(
        <DeleteOrganizationDialog organization={mockOrganization}>
          <button>Delete Organization</button>
        </DeleteOrganizationDialog>
      );
      
      cy.contains('Delete Organization').click();
      cy.contains('Delete Organization').should('be.visible');
      cy.contains('This action cannot be undone').should('be.visible');
    });

    it('enables delete button only when confirmation text matches', () => {
      cy.mount(
        <DeleteOrganizationDialog organization={mockOrganization}>
          <button>Delete Organization</button>
        </DeleteOrganizationDialog>
      );
      
      cy.contains('Delete Organization').click();
      
      // Button should be disabled initially
      cy.contains('I understand, delete this organization').should('be.disabled');
      
      // Enter incorrect confirmation
      cy.get('input#org-name').type('Wrong Name');
      cy.contains('I understand, delete this organization').should('be.disabled');
      
      // Enter correct confirmation
      cy.get('input#org-name').clear().type(mockOrganization.name);
      cy.contains('I understand, delete this organization').should('not.be.disabled');
    });

    it('calls deleteOrganization and onDelete when confirmed', () => {
      const deleteOrgStub = cy.stub().resolves();
      cy.stub(OrganizationProvider, 'useOrganization').returns({
        deleteOrganization: deleteOrgStub,
      });

      const onDeleteSpy = cy.stub();
      cy.mount(
        <DeleteOrganizationDialog organization={mockOrganization} onDelete={onDeleteSpy}>
          <button>Delete Organization</button>
        </DeleteOrganizationDialog>
      );
      
      cy.contains('Delete Organization').click();
      cy.get('input#org-name').type(mockOrganization.name);
      cy.contains('I understand, delete this organization').click();
      
      // Verify the delete function was called
      cy.wrap(deleteOrgStub).should('be.calledWith', mockOrganization.id);
      cy.wrap(onDeleteSpy).should('be.called');
    });
  });
});