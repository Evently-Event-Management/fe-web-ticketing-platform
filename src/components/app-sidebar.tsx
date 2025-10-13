"use client"

import * as React from "react"
import {
    Building2,
    CalendarRange,
    RockingChair,
    LayoutDashboard,
    CalendarDays,
    Building, Users,
} from "lucide-react"
import Link from "next/link";
import Image from "next/image";
import {useSidebar} from "@/components/ui/sidebar"
import {NavMain} from "@/components/nav-main"
import {NavOrg} from "@/components/nav-org"
import {NavUser} from "@/components/nav-user"
import {OrganizationSwitcher} from "@/components/OrganizationSwitcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"
import {useAuth} from "@/providers/AuthProvider";
import {useOrganization} from "@/providers/OrganizationProvider";
import {useLimits} from "@/providers/LimitProvider"; // Import the limits hook

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {isAuthenticated, keycloak} = useAuth();
    const {organization} = useOrganization();
    const {myLimits} = useLimits(); // Get current user limits
    const {open} = useSidebar();

    if (!isAuthenticated || !keycloak) {
        return null;
    }

    // ✅ Dynamically create the navigation data
    const navData = {
        navMain: [
            {
                title: "Dashboard",
                url: organization ? `/manage/organization/${organization.id}` : "#",
                icon: LayoutDashboard,
                isActive: true,
            },
            {
                title: "Events",
                url: "#",
                icon: CalendarRange,
                isActive: true,
                items: [
                    {
                        title: "Create an Event",
                        url: organization ? `/manage/organization/${organization.id}/event/create` : "#"
                    },
                    {title: "My Events", url: organization ? `/manage/organization/${organization.id}/event` : "#"},
                ],
            },
            {
                title: "Staff Management",
                url: organization ? `/manage/organization/${organization.id}/staff` : "#",
                icon: Users
            },
            {
                title: "Seating Layouts",
                url: organization ? `/manage/organization/${organization.id}/seating` : "#",
                icon: RockingChair
            },
        ],
        navOrg: [
            {name: "My Organizations", url: "/manage/organization/my-organizations", icon: Building2}
        ],
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className={`data-[slot=sidebar-menu-button]:!p-2 ${!open ? 'justify-center' : ''}`}
                        >
                            <Link className="flex items-center " href="/manage/organization">
                                <div className="relative h-14 w-14">
                                    <Image 
                                        src="/images/logo-high.png"
                                        alt="Ticketly Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                {open &&
                                    <span className="text-xl font-bold text-sidebar-primary mb-0.5">Ticketly</span>}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <OrganizationSwitcher/>
            </SidebarHeader>
            <SidebarContent>
                {/* ✅ Pass the dynamic data to the components */}
                <NavMain items={navData.navMain}/>
                <NavOrg links={navData.navOrg}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{
                        name: keycloak.tokenParsed?.name || "Guest",
                        email: keycloak.tokenParsed?.email || "",
                        avatar: keycloak.tokenParsed?.picture || "",
                    }}
                    tierName={myLimits?.currentTier}
                />
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}

/**
 * Admin Sidebar component with simplified structure.
 * Does not include organization switcher, just logo and admin links.
 */
export function AppSidebarAdmin({...props}: React.ComponentProps<typeof Sidebar>) {
    const {isAuthenticated, keycloak} = useAuth();
    // const {myLimits} = useLimits(); // Get current user limits
    const {open} = useSidebar();

    if (!isAuthenticated || !keycloak) {
        return null;
    }

    // Admin navigation data with just Events and Organizations links
    const adminNavData = {
        navMain: [
            {
                title: "Dashboard",
                url: "/manage/admin",
                icon: LayoutDashboard,
                isActive: true,
            },
            {
                title: "Events",
                url: "/manage/admin/events",
                icon: CalendarDays
            },
            {
                title: "Organizations",
                url: "/manage/admin/organizations",
                icon: Building
            },
        ]
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size={'lg'}
                            asChild
                            className={`data-[slot=sidebar-menu-button]:!p-2 ${!open ? 'justify-center' : ''}`}
                        >
                            <Link className="flex items-center space-x-2" href="/manage/admin">
                                <div className="relative h-8 w-8">
                                    <Image 
                                        src="/images/logo-high.png"
                                        alt="Ticketly Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                {open && (
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold text-sidebar-primary">Ticketly</span>
                                        <span className="text-xs text-muted-foreground -mt-1">Admin Console</span>
                                    </div>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={adminNavData.navMain}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{
                        name: keycloak.tokenParsed?.name || "Guest",
                        email: keycloak.tokenParsed?.email || "",
                        avatar: keycloak.tokenParsed?.picture || "",
                    }}
                />
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
