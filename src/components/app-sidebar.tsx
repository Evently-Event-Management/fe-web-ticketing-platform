"use client"

import * as React from "react"
import {
    Building2,
    CalendarRange,
    RockingChair,
    Ticket,
} from "lucide-react"
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar" // ✅ Import the hook
import { NavMain } from "@/components/nav-main"
import { NavOrg } from "@/components/nav-org"
import { NavUser } from "@/components/nav-user"
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/providers/AuthProvider";

const data = {
    navMain: [
        {
            title: "Events",
            url: "#",
            icon: CalendarRange,
            isActive: true,
            items: [
                { title: "Create an Event", url: "#" },
                { title: "All Events", url: "#" }
            ],
        },
        { title: "Seating Layouts", url: "#", icon: RockingChair }
    ],
    navOrg: [
        { name: "My Organizations", url: "/manage/organization/my-organizations", icon: Building2 }
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isAuthenticated, keycloak } = useAuth();
    const { open } = useSidebar(); // ✅ Get the collapsed state

    if (!isAuthenticated || !keycloak) {
        return null;
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            // ✅ Adjust padding for collapsed state
                            className={`data-[slot=sidebar-menu-button]:!p-2 ${!open ? 'justify-center' : ''}`}
                        >
                            <Link className="flex items-center space-x-2 " href="/manage/organization">
                                <Ticket className="!size-6 text-primary" />
                                {/* ✅ Conditionally render the name */}
                                {open && <span className="text-xl font-bold text-primary mb-0.5">Ticketly</span>}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* ✅ Pass the collapsed state to the switcher */}
                <OrganizationSwitcher/>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavOrg links={data.navOrg} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{
                    name: keycloak.tokenParsed?.name || "Guest",
                    email: keycloak.tokenParsed?.email || "",
                    avatar: keycloak.tokenParsed?.picture || "",
                }} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
