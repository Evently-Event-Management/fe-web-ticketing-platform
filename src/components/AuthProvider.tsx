// components/AuthProvider.tsx
'use client'

import { useEffect, useState, ReactNode, createContext, useContext } from 'react'
import keycloak from '@/lib/keycloak'

interface AuthContextType {
    isAuthenticated: boolean
    keycloak: typeof keycloak
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setAuthenticated] = useState(false)
    const [isInitialized, setInitialized] = useState(false)

    useEffect(() => {
        keycloak
            .init({
                onLoad: 'check-sso', // Don't force login
                pkceMethod: 'S256',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            })
            .then((auth) => {
                setAuthenticated(auth)
                setInitialized(true)
            })
            .catch((err) => {
                console.error('Keycloak init failed:', err)
                setInitialized(true) // Still allow app to load
            })
    }, [])

    if (!isInitialized) return <p>Loading...</p>

    return (
        <AuthContext.Provider value={{ isAuthenticated, keycloak }}>
            {children}
        </AuthContext.Provider>
    )
}
