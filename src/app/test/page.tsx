'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import keycloak from '@/lib/keycloak';

// Define a type for the expected API response
type ApiResponse = {
    message: string;
    // Add other properties you expect from the backend
    uid?: string;
    username?: string;
    scope?: string;
};

const Page = () => {
    // Initialize state to null or an object with a default message
    const [data, setData] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!keycloak.authenticated) {
            setError('User not authenticated. Please log in.');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await apiFetch<ApiResponse>('/event-seating/v1/protected/hello');
                setData(response);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to connect to the API. Make sure the backend is running and accessible.');
            }
        };

        fetchData();
    }, []);

    // Render different UI based on the state
    let content;
    if (error) {
        content = <p style={{ color: 'red' }}>{error}</p>;
    } else if (!data) {
        content = <p>Loading...</p>;
    } else {
        // ✅ CORRECT: Render a specific property from the data object
        content = <p>{data.message}</p>;
    }

    return (
        <div>
            <h1>API Test Page</h1>
            {content}
        </div>
    );
};

export default Page;