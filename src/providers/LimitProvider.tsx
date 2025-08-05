'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useAuth} from '@/providers/AuthProvider';
import {getMyLimits} from '@/lib/actions/configActions';
import {MyLimitsResponse, TierLimitDetails} from '@/types/config';

// Define the shape of the context
interface LimitContextType {
    myLimits: MyLimitsResponse | null;
    isLoading: boolean;
    error: string | null;
    // For convenience, we can still expose the direct tier limits
    currentUserTierLimits: TierLimitDetails | null;
}

const LimitContext = createContext<LimitContextType | undefined>(undefined);

export const LimitProvider = ({children}: { children: ReactNode }) => {
    const {isAuthenticated} = useAuth();
    const [myLimits, setMyLimits] = useState<MyLimitsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the user-specific limits when authenticated
    useEffect(() => {
        // Only fetch if the user is authenticated
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        const fetchMyLimits = async () => {
            setIsLoading(true);
            try {
                const limits = await getMyLimits();
                setMyLimits(limits);
            } catch (err) {
                setError('Failed to load your account limits.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyLimits().then();
    }, [isAuthenticated]);


    const value: LimitContextType = {
        myLimits,
        isLoading,
        error,
        currentUserTierLimits: myLimits?.tierLimits || null
    };

    return (
        <LimitContext.Provider value={value}>
            {children}
        </LimitContext.Provider>
    );
};

// The custom hook to easily access the limits
export const useLimits = (): LimitContextType => {
    const context = useContext(LimitContext);
    if (context === undefined) {
        throw new Error('useLimits must be used within a LimitProvider');
    }
    return context;
};
