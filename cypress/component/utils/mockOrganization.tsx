import React from 'react';
import { OrganizationResponse } from '@/types/oraganizations';

// Mock organization provider context
export const mockOrganizationProvider = (organization: OrganizationResponse | null = null, organizations: OrganizationResponse[] = []) => {
  const mockContext = {
    organization,
    organizations,
    isLoading: false,
    error: null,
    switchOrganization: cy.stub().resolves(),
    createOrganization: cy.stub().resolves(organization || organizations[0]),
    uploadLogo: cy.stub().resolves(organization || organizations[0]),
    removeLogo: cy.stub().resolves(),
    updateOrganization: cy.stub().resolves(organization || organizations[0]),
    deleteOrganization: cy.stub().resolves(),
    refreshOrganizations: cy.stub().resolves(),
  };

  cy.stub(React, 'useContext').returns(mockContext);
  return mockContext;
};

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