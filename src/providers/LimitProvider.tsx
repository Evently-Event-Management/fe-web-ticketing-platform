'use client';

import {createContext, useContext, useState, useEffect, ReactNode, useMemo} from 'react';
import {useAuth} from '@/providers/AuthProvider';
import {getAppConfiguration} from '@/lib/actions/configActions';
import {AppConfig, TierLimitDetails, TierName} from '@/types/config';

// Define the shape of the context
interface LimitContextType {
    config: AppConfig | null;
    isLoading: boolean;
    error: string | null;
    currentUserTier: TierName;
    currentUserTierLimits: TierLimitDetails | null;
    getLimitsForTier: (tier: TierName) => TierLimitDetails | null;
}

const LimitContext = createContext<LimitContextType | undefined>(undefined);

export const LimitProvider = ({children}: { children: ReactNode }) => {
    const {keycloak} = useAuth();
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the entire configuration on initial application load
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const appConfig = await getAppConfiguration();
                setConfig(appConfig);
            } catch (err) {
                setError('Failed to load application configuration. Some features may be unavailable.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // Helper to safely extract user_groups from tokenParsed
    function getUserGroupsFromTokenParsed(tokenParsed: any): string[] {
        if (
            !tokenParsed ||
            !Array.isArray(tokenParsed.user_groups) ||
            !tokenParsed.user_groups.every((g: any) => typeof g === 'string')
        ) {
            return [];
        }
        return tokenParsed.user_groups;
    }

    // A memoized helper to get the current user's highest tier from their JWT
    const currentUserTier = useMemo((): TierName => {
        const userGroups: string[] = getUserGroupsFromTokenParsed(keycloak?.tokenParsed);
        if (userGroups.length === 0) return 'FREE';
        let highestTier: TierName = 'FREE';
        let maxLevel = 0;

        const tierLevels: Record<TierName, number> = {FREE: 0, PRO: 1, ENTERPRISE: 2};

        userGroups.forEach(group => {
            if (group.startsWith('/Tiers/')) {
                const tierName = group.substring('/Tiers/'.length).toUpperCase() as TierName;
                if (tierLevels[tierName] !== undefined && tierLevels[tierName] > maxLevel) {
                    maxLevel = tierLevels[tierName];
                    highestTier = tierName;
                }
            }
        });
        return highestTier;
    }, [keycloak]);

    // A memoized value for the current user's specific limits, derived from the full config
    const currentUserTierLimits = useMemo(() => {
        if (!config) return null;
        return config.tierLimits[currentUserTier] || config.tierLimits.FREE;
    }, [config, currentUserTier]);

    // A function to get limits for any specified tier (useful for upgrade pages)
    const getLimitsForTier = (tier: TierName): TierLimitDetails | null => {
        if (!config) return null;
        return config.tierLimits[tier] || null;
    };

    const value = {config, isLoading, error, currentUserTier, currentUserTierLimits, getLimitsForTier};

    return (
        <LimitContext.Provider value={value}>
            {children}
        </LimitContext.Provider>
    );
};

// The custom hook to easily access the limits from any component
export const useLimits = (): LimitContextType => {
    const context = useContext(LimitContext);
    if (context === undefined) {
        throw new Error('useLimits must be used within a LimitProvider');
    }
    return context;
};
