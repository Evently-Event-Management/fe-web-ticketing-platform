'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { OrganizationRequest, OrganizationResponse } from '@/types/oraganizations';
// ✅ Import the new action functions
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
    const router = useRouter();

    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setupOrganization = useCallback(async (isMounted: boolean) => {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);
        let orgFound = false;

        const storedOrgId = localStorage.getItem('selectedOrgId');
        if (storedOrgId) {
            try {
                // ✅ Use the action
                const orgDetails = await getOrganizationById(storedOrgId);
                if (isMounted) {
                    setOrganization(orgDetails);
                    orgFound = true;
                }
            } catch (err) {
                console.warn(`Could not fetch stored organization (ID: ${storedOrgId}). It may be invalid.`);
                localStorage.removeItem('selectedOrgId');
            }
        }

        if (!orgFound) {
            try {
                // ✅ Use the action
                const fetchedOrgs = await getOrganizations();
                if (!isMounted) return;

                setOrganizations(fetchedOrgs);

                if (fetchedOrgs && fetchedOrgs.length > 0) {
                    const firstOrg = fetchedOrgs[0];
                    localStorage.setItem('selectedOrgId', firstOrg.id);
                    setOrganization(firstOrg);
                } else {
                    console.log('No organizations found. Creating a new one...');
                    const userName = keycloak.tokenParsed?.given_name || 'My';
                    const newOrgRequest: OrganizationRequest = { name: `${userName}'s Organization` };
                    // ✅ Use the action
                    const newOrg = await createNewOrganization(newOrgRequest);
                    if (isMounted) {
                        localStorage.setItem('selectedOrgId', newOrg.id);
                        setOrganization(newOrg);
                        setOrganizations([newOrg]);
                    }
                }
            } catch (err) {
                console.error('Failed to set up organization:', err);
                if (isMounted) setError('An error occurred during organization setup.');
            }
        }

        if (isMounted) setIsLoading(false);
    }, [keycloak]);

    useEffect(() => {
        if (!isAuthenticated || !keycloak.tokenParsed) return;
        let isMounted = true;
        setupOrganization(isMounted);
        return () => { isMounted = false; };
    }, [isAuthenticated, keycloak, setupOrganization]);

    const refreshOrganizations = async () => {
        // ✅ Use the action
        const fetchedOrgs = await getOrganizations();
        setOrganizations(fetchedOrgs);
    };

    const switchOrganization = async (orgId: string) => {
        setIsLoading(true);
        try {
            // ✅ Use the action
            const orgDetails = await getOrganizationById(orgId);
            localStorage.setItem('selectedOrgId', orgId);
            setOrganization(orgDetails);
            router.push(`/manage/organization/${orgId}`);
        } catch (err) {
            setError("Failed to switch organization.");
        } finally {
            setIsLoading(false);
        }
    };

    const createOrganization = async (newOrgRequest: OrganizationRequest) => {
        // ✅ Use the action
        const newOrg = await createNewOrganization(newOrgRequest);
        setOrganizations(prevOrgs => [...prevOrgs, newOrg]);
        await switchOrganization(newOrg.id);
    };

    const deleteOrganization = async (orgId: string) => {
        // ✅ Use the action
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
