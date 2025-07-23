// components/AuthProvider.tsx
'use client'

import { useEffect, useState, ReactNode } from 'react'
import keycloak from '@/lib/keycloak'

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        keycloak
            .init({
                onLoad: 'login-required',
                pkceMethod: 'S256',
            })
            .then((auth) => {
                setAuthenticated(auth)
            })
            .catch((err) => console.error('Keycloak init failed:', err))
    }, [])

    if (!isAuthenticated) return <p>Loading...</p>

    return <>{children}</>
}
