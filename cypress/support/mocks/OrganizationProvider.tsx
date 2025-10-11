'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { OrganizationResponse } from '@/types/oraganizations';
import { mockOrganization } from './organization';

// Define the context type
interface OrganizationContextType {
  organization: OrganizationResponse | null;
  organizations: OrganizationResponse[];
  isLoading: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (newOrgRequest: any) => Promise<OrganizationResponse>;
  uploadLogo: (orgId: string, file: File) => Promise<OrganizationResponse>;
  removeLogo: (orgId: string) => Promise<void>;
  updateOrganization: (orgId: string, orgUpdateRequest: any) => Promise<OrganizationResponse>;
  deleteOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

// Create a default context value
const defaultOrgContext: OrganizationContextType = {
  organization: mockOrganization,
  organizations: [mockOrganization],
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

// Create the context
const OrganizationContext = createContext<OrganizationContextType>(defaultOrgContext);

// Create a provider component
export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <OrganizationContext.Provider value={defaultOrgContext}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Create a hook for using the organization context
export const useOrganization = () => useContext(OrganizationContext);

export default OrganizationContext;