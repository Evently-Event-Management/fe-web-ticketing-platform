// lib/keycloak.ts
'use client'

import Keycloak from 'keycloak-js'

// --- Step 1: Get and Validate the Environment Variables ---
const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const keycloakRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
const keycloakClientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

// If any of the required variables are missing, throw an error immediately.
if (!keycloakUrl || !keycloakRealm || !keycloakClientId) {
    throw new Error("Missing Keycloak environment variables. Please check your .env.local file.");
}

// --- Step 2: Initialize Keycloak (only in the browser) ---
let keycloakInstance: Keycloak | null = null;

if (typeof window !== 'undefined') {
    // TypeScript now knows these variables are strings because of the check above.
    keycloakInstance = new Keycloak({
        url: keycloakUrl,
        realm: keycloakRealm,
        clientId: keycloakClientId,
    });
}

const keycloak = keycloakInstance;

export default keycloak;