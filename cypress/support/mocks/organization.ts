// Import necessary types for our mocks
import { OrganizationResponse } from '@/types/oraganizations';
// Import the module for stubbing, not the hook directly
import * as OrganizationProvider from '@/providers/OrganizationProvider';

// Sample organization data for testing
export const mockOrganization: OrganizationResponse = {
  id: 'org-test-123',
  name: 'Test Organization',
  website: 'https://test-org.com',
  logoUrl: 'https://test-org.com/logo.png',
  createdAt: '2023-01-01T12:00:00.000Z',
  updatedAt: '2023-01-10T14:30:00.000Z',
  eventCount: 5
};

export const mockOrganizationNoLogo: OrganizationResponse = {
  id: 'org-test-456',
  name: 'Test Organization No Logo',
  website: '',
  createdAt: '2023-02-01T12:00:00.000Z',
  updatedAt: '2023-02-10T14:30:00.000Z',
  eventCount: 0
};

// Helper to mock the useOrganization hook
export const mockUseOrganization = () => {
  const mockHook = {
    organization: mockOrganization,
    organizations: [mockOrganization, mockOrganizationNoLogo],
    isLoading: false,
    error: null,
    switchOrganization: cy.stub().resolves(),
    createOrganization: cy.stub().resolves(mockOrganization),
    uploadLogo: cy.stub().resolves(mockOrganization),
    removeLogo: cy.stub().resolves(),
    updateOrganization: cy.stub().resolves(mockOrganization),
    deleteOrganization: cy.stub().resolves(),
    refreshOrganizations: cy.stub().resolves()
  };
  
  cy.stub(OrganizationProvider, 'useOrganization').returns(mockHook);
  
  return mockHook;
};