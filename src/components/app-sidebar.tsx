"use client"

import * as React from "react"
import {
    AudioWaveform,
    Building2,
    CalendarRange,
    Command,
    GalleryVerticalEnd,
    RockingChair, Ticket,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavOrg} from "@/components/nav-org"
import {NavUser} from "@/components/nav-user"
import {OrganizationSwitcher} from "@/components/OrganizationSwitcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import {useAuth} from "@/providers/AuthProvider";
import Link from "next/link";

// This is sample data.
const data = {
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Events",
            url: "#",
            icon: CalendarRange,
            isActive: true,
            items: [
                {
                    title: "Create an Event",
                    url: "#",
                },
                {
                    title: "All Events",
                    url: "#",
                }
            ],
        },
        {
            title: "Seating Layouts",
            url: "#",
            icon: RockingChair
        }
    ],
    navOrg: [
        {
            name: "My Organizations",
            url: "#",
            icon: Building2,
        }
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {isAuthenticated, keycloak} = useAuth()

    if (!isAuthenticated || !keycloak) {
        return null; // Or a loading spinner
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="mr-4 flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <div className="flex items-center gap-2 p-3 text-primary">
                            <Ticket className="size-6 text-primary"/>
                            <span className="text-xl font-bold">Ticketly</span>
                        </div>
                    </Link>
                </div>
                <OrganizationSwitcher/>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
                <NavOrg links={data.navOrg}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={
                    {
                        name: keycloak.tokenParsed?.name || "Guest",
                        email: keycloak.tokenParsed?.email || "",
                        avatar: keycloak.tokenParsed?.picture || "",
                    }
                }/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
