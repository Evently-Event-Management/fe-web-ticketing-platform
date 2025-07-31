'use client';

import * as React from 'react';
import {ChevronsUpDown, Building, Plus} from 'lucide-react';
import Image from 'next/image';
import {useOrganization} from '@/providers/OrganizationProvider';
import {CreateOrganizationDialog} from './OrganizationDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import {Skeleton} from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function OrganizationSwitcher() {
    const { open } = useSidebar(); // Get the collapsed state from sidebar context
    const {
        organization: activeOrganization,
        organizations,
        switchOrganization,
        isLoading,
    } = useOrganization();

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <div className={`flex items-center gap-3 p-2 ${!open ? "justify-center" : ""}`}>
                        <Skeleton className="size-8 rounded-lg"/>
                        {open && (
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 w-24"/>
                            </div>
                        )}
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    if (!activeOrganization) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <div className={`p-2 flex ${!open ? "justify-center" : "flex-col gap-2"}`}>
                        {open ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <Building className="size-4"/>
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="font-medium">No Organization Selected</span>
                                    </div>
                                </div>
                                <CreateOrganizationDialog>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full flex items-center gap-1.5"
                                    >
                                        <Plus className="size-3.5" />
                                        Create Organization
                                    </Button>
                                </CreateOrganizationDialog>
                            </>
                        ) : (
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Building className="size-4"/>
                            </div>
                        )}
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }
    
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {activeOrganization.logoUrl ? (
                                <div
                                    className="relative flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                                    <Image
                                        src={activeOrganization.logoUrl}
                                        alt={`${activeOrganization.name} logo`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Building className="size-4"/>
                                </div>
                            )}
                            {open && (
                                <>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{activeOrganization.name}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto"/>
                                </>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Your Organizations
                        </DropdownMenuLabel>
                        {organizations.map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => switchOrganization(org.id)}
                                className="gap-2 p-2"
                                disabled={org.id === activeOrganization.id}
                            >
                                {org.logoUrl ? (
                                    <div
                                        className="relative flex size-6 items-center justify-center rounded-md overflow-hidden">
                                        <Image
                                            src={org.logoUrl}
                                            alt={`${org.name} logo`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex size-6 items-center justify-center rounded-md border">
                                        <Building className="size-3.5 shrink-0"/>
                                    </div>
                                )}
                                {org.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator/>
                        <CreateOrganizationDialog>
                            <DropdownMenuItem
                                className="gap-2 p-2"
                                onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                            >
                                <div
                                    className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <Plus className="size-4"/>
                                </div>
                                <div className="font-medium">Create Organization</div>
                            </DropdownMenuItem>
                        </CreateOrganizationDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
