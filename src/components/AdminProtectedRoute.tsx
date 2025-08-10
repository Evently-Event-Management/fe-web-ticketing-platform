'use client'

import React, {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '@/providers/AuthProvider'

export default function AdminProtectedRoute({
                                                children
                                            }: {
    children: React.ReactNode
}) {
    const {isAuthenticated, isAdmin} = useAuth()
    const router = useRouter()

    useEffect(() => {
        // If user is not authenticated or not an admin, redirect to homepage
        if (isAuthenticated && !isAdmin()) {
            router.replace('/')
        } else if (!isAuthenticated) {
            // If not authenticated, let the keycloak handle redirection
        }
    }, [isAuthenticated, isAdmin, router])

    // If not authenticated, show nothing (keycloak will handle redirection)
    if (!isAuthenticated) return null

    // If not an admin, show nothing while redirecting
    if (!isAdmin()) return null

    // If user is an admin, show the children
    return <>{children}</>
}
