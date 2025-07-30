'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { OrganizationRequest, OrganizationResponse } from '@/types/oraganizations';
import {
    getOrganizations,
    getOrganizationById,
    createNewOrganization,
    deleteOrganizationById
} from '@/lib/actions/organizationActions';

// Define the shape of the context state
interface OrganizationContextType {
    organization: OrganizationResponse | null;
    organizations: OrganizationResponse[];
    isLoading: boolean;
    error: string | null;
    switchOrganization: (orgId: string) => Promise<void>;
    createOrganization: (newOrgRequest: OrganizationRequest) => Promise<void>;
    deleteOrganization: (orgId: string) => Promise<void>;
    refreshOrganizations: () => Promise<void>;
}

// Create the context with a default value
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Define the props for the provider component
interface OrganizationProviderProps {
    children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
    const { isAuthenticated, keycloak } = useAuth();

    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setupOrganization = useCallback(async (isMounted: boolean) => {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        try {
            // --- 1. ALWAYS fetch the full list of organizations first ---
            const fetchedOrgs = await getOrganizations();
            if (!isMounted) return;

            setOrganizations(fetchedOrgs);
            let activeOrg: OrganizationResponse | null = null;
            const storedOrgId = localStorage.getItem('selectedOrgId');

            if (fetchedOrgs && fetchedOrgs.length > 0) {
                // --- 2. Determine the active organization ---
                // Try to find the stored org in the fetched list
                if (storedOrgId) {
                    activeOrg = fetchedOrgs.find(org => org.id === storedOrgId) || null;
                }
                // If not found or not stored, default to the first one
                if (!activeOrg) {
                    activeOrg = fetchedOrgs[0];
                }
            } else {
                // --- 3. If no organizations exist, create one ---
                console.log('No organizations found. Creating a new one...');
                const userName = keycloak.tokenParsed?.given_name || 'My';
                const newOrgRequest: OrganizationRequest = { name: `${userName}'s Organization` };
                activeOrg = await createNewOrganization(newOrgRequest);
                if (isMounted) {
                    setOrganizations([activeOrg]);
                }
            }

            // --- 4. Set the final state ---
            if (isMounted && activeOrg) {
                localStorage.setItem('selectedOrgId', activeOrg.id);
                setOrganization(activeOrg);
            }

        } catch (err) {
            console.error('Failed to set up organization:', err);
            if (isMounted) setError('An error occurred during organization setup.');
        } finally {
            if (isMounted) setIsLoading(false);
        }
    }, [keycloak]);

    useEffect(() => {
        if (!isAuthenticated || !keycloak.tokenParsed) return;
        let isMounted = true;
        setupOrganization(isMounted);
        return () => { isMounted = false; };
    }, [isAuthenticated, keycloak, setupOrganization]);

    const refreshOrganizations = async () => {
        const fetchedOrgs = await getOrganizations();
        setOrganizations(fetchedOrgs);
    };

    const switchOrganization = async (orgId: string) => {
        setIsLoading(true);
        try {
            const orgDetails = await getOrganizationById(orgId);
            localStorage.setItem('selectedOrgId', orgId);
            setOrganization(orgDetails);
            // No need to push route here if the component using this is already on the correct page
        } catch (err) {
            setError("Failed to switch organization.");
        } finally {
            setIsLoading(false);
        }
    };

    const createOrganization = async (newOrgRequest: OrganizationRequest) => {
        const newOrg = await createNewOrganization(newOrgRequest);
        setOrganizations(prevOrgs => [...prevOrgs, newOrg]);
        await switchOrganization(newOrg.id);
    };

    const deleteOrganization = async (orgId: string) => {
        await deleteOrganizationById(orgId);
        const updatedOrgs = organizations.filter(org => org.id !== orgId);
        setOrganizations(updatedOrgs);

        if (organization?.id === orgId) {
            if (updatedOrgs.length > 0) {
                await switchOrganization(updatedOrgs[0].id);
            } else {
                setOrganization(null);
                localStorage.removeItem('selectedOrgId');
            }
        }
    };

    const value = { organization, organizations, isLoading, error, switchOrganization, createOrganization, deleteOrganization, refreshOrganizations };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = (): OrganizationContextType => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};
