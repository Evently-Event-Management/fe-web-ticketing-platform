"use client"

import * as React from "react"
import {
    AudioWaveform,
    Building2,
    CalendarRange,
    Command,
    GalleryVerticalEnd,
    RockingChair,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavOrg} from "@/components/nav-org"
import {NavUser} from "@/components/nav-user"
import {OrganizationSwitcher} from "@/components/organizationSwitcher-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import {useAuth} from "@/providers/AuthProvider";

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
            name: "Manage Organization",
            url: "#",
            icon: Building2,
        }
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {isAuthenticated, keycloak} = useAuth()

    if (!isAuthenticated || !keycloak) {
        keycloak.login().then(r => {
                console.log("Redirecting to Keycloak login", r);
            }
        ).catch(error => {
            console.error("Keycloak login error:", error);
        });
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
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
