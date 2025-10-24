'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEventContext } from "@/providers/EventProvider"
import { useParams, usePathname, useRouter } from "next/navigation"
import { BarChart2, ChevronLeft, Settings, Ticket } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton'

export default function SessionLayout({ children }: { children: React.ReactNode }) {
    const { event, isLoading } = useEventContext()
    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const sessionId = params.sessionId as string
    const eventId = params.eventId as string
    const organizationId = params.organization_id as string

    // Base URL for this session
    const baseUrl = `/manage/organization/${organizationId}/event/${eventId}/sessions/${sessionId}`
    // URL to return to even page
    const sessionsUrl = `/manage/organization/${organizationId}/event/${eventId}/sessions`

    // Get active tab based on pathname
    const getActiveTab = () => {
        if (pathname.includes('/tickets')) {
            return 'tickets'
        }
        if (pathname.includes('/analytics')) {
            return 'analytics'
        }
        return 'details'
    }

    const activeTab = getActiveTab()

    // Handle tab change - direct navigation to pages
    const handleTabChange = (value: string) => {
        if (pathname.includes('/edit-layout')) {
            // Don't navigate away from layout editor
            return
        }

        if (value === 'analytics') {
            router.push(`${baseUrl}/analytics`)
        } else if (value === 'tickets') {
            router.push(`${baseUrl}/tickets`)
        } else {
            router.push(`${baseUrl}`)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-8 w-full mb-6" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    Event not found
                </div>
            </div>
        )
    }

    const session = event.sessions.find(s => s.id === sessionId)

    if (!session) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    Session not found
                </div>
            </div>
        )
    }

    // Don't show tabs on the edit-layout page
    if (pathname.includes('/edit-layout')) {
        return <>{children}</>
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Back button and title */}
            <div className="mb-6 flex items-center justify-between">
                <Link href={sessionsUrl} passHref>
                    <Button variant="ghost" className="gap-2 pl-0">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Sessions</span>
                    </Button>
                </Link>

                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="space-y-4"
                >
                    <TabsList className="grid w-full grid-cols-3 max-w-xl">
                        <TabsTrigger value="details" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span>Session Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            <span>Analytics</span>
                        </TabsTrigger>
                        <TabsTrigger value="tickets" className="flex items-center gap-2">
                            <Ticket className="h-4 w-4" />
                            <span>Tickets</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {children}

        </div>
    )
}
