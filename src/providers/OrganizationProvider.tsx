'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback} from 'react';
import {useAuth} from '@/providers/AuthProvider';
import {OrganizationRequest, OrganizationResponse} from '@/types/oraganizations';
import {
    getOrganizations,
    getOrganizationById,
    createNewOrganization,
    deleteOrganizationById, uploadOrganizationLogo, removeOrganizationLogo, updateOrganizationById
} from '@/lib/actions/organizationActions';
import {useRouter} from "next/navigation";

// Define the shape of the context state
interface OrganizationContextType {
    organization: OrganizationResponse | null;
    organizations: OrganizationResponse[];
    isLoading: boolean;
    error: string | null;
    switchOrganization: (orgId: string) => Promise<void>;
    createOrganization: (newOrgRequest: OrganizationRequest) => Promise<OrganizationResponse>;
    uploadLogo: (orgId: string, file: File) => Promise<OrganizationResponse>;
    removeLogo: (orgId: string) => Promise<void>;
    updateOrganization: (orgId: string, orgUpdateRequest: OrganizationRequest) => Promise<OrganizationResponse>;
    deleteOrganization: (orgId: string) => Promise<void>;
    refreshOrganizations: () => Promise<void>;
}

// Create the context with a default value
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Define the props for the provider component
interface OrganizationProviderProps {
    children: ReactNode;
}

export const OrganizationProvider = ({children}: OrganizationProviderProps) => {
    const {isAuthenticated, keycloak} = useAuth();
    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const setupOrganization = useCallback(async (isMounted: boolean) => {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        try {
            const fetchedOrgs = await getOrganizations();
            if (!isMounted) return;

            setOrganizations(fetchedOrgs);
            let activeOrg: OrganizationResponse | null = null;
            const storedOrgId = localStorage.getItem('selectedOrgId');

            if (fetchedOrgs && fetchedOrgs.length > 0) {
                if (storedOrgId) {
                    activeOrg = fetchedOrgs.find(org => org.id === storedOrgId) || null;
                }
                if (!activeOrg) {
                    activeOrg = fetchedOrgs[0];
                }
            }
            // ✅ Automatic creation logic has been removed.
            // If no orgs are found, activeOrg will remain null.

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
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !keycloak.tokenParsed) return;
        let isMounted = true;
        setupOrganization(isMounted);
        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, keycloak, setupOrganization]);

    const refreshOrganizations = async () => {
        const fetchedOrgs = await getOrganizations();
        setOrganizations(fetchedOrgs);
        if (organization) {
            const activeOrg = fetchedOrgs.find(org => org.id === organization.id);
            if (activeOrg) {
                setOrganization(activeOrg);
            } else {
                setOrganization(null);
                localStorage.removeItem('selectedOrgId');
                router.push('/manage/organizations/my-organizations');
            }
        }
    };

    const switchOrganization = async (orgId: string) => {
        setIsLoading(true);
        try {
            const orgDetails = await getOrganizationById(orgId);
            localStorage.setItem('selectedOrgId', orgId);
            setOrganization(orgDetails);
            router.push(`/manage/organization/${orgId}`);
        } catch (err) {
            console.error('Failed to switch organization:', err);
            setError("Failed to switch organization.");
        } finally {
            setIsLoading(false);
        }
    };

    const createOrganization = async (newOrgRequest: OrganizationRequest) => {
        const newOrg = await createNewOrganization(newOrgRequest);
        // After creating, refresh the list and set the new one as active
        await refreshOrganizations();
        await switchOrganization(newOrg.id);
        return newOrg;
    };

    const updateOrganization = async (orgId: string, orgUpdateRequest: OrganizationRequest): Promise<OrganizationResponse> => {
        const updatedOrg = await updateOrganizationById(orgId, orgUpdateRequest);
        setOrganizations(prevOrgs => prevOrgs.map(org => (org.id === orgId ? updatedOrg : org)));
        if (organization?.id === orgId) {
            setOrganization(updatedOrg);
        }
        return updatedOrg;
    };

    const uploadLogo = async (orgId: string, file: File): Promise<OrganizationResponse> => {
        const updatedOrg = await uploadOrganizationLogo(orgId, file);
        await refreshOrganizations();
        return updatedOrg;
    };

    const removeLogo = async (orgId: string): Promise<void> => {
        await removeOrganizationLogo(orgId);
        await refreshOrganizations();
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

    const value = {
        organization,
        organizations,
        isLoading,
        error,
        switchOrganization,
        createOrganization,
        deleteOrganization,
        refreshOrganizations,
        uploadLogo,
        removeLogo,
        updateOrganization
    };

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
