'use client'

import {AppSidebar} from "@/components/app-sidebar"
import {Separator} from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import React from "react";
import {ModeToggle} from "@/components/ModeToggle";
import {Button} from "@/components/ui/button";
import {Bell, ShieldCheck} from "lucide-react";
import {OrganizationProvider} from "@/providers/OrganizationProvider";
import Link from "next/link";
import {useAuth} from "@/providers/AuthProvider";
import {LimitProvider} from "@/providers/LimitProvider";
import Notice from "@/components/ui/Notice";

export default function Layout({children}: Readonly<{ children: React.ReactNode }>) {
    const {isAdmin, isAuthenticated} = useAuth();
    const userIsAdmin = isAdmin();

    return (
        <LimitProvider>
            <OrganizationProvider>
                <SidebarProvider>
                    <AppSidebar/>
                    <SidebarInset>
                        <header
                            className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-sm bg-background border-b border-border">
                            <div className="flex justify-between w-full items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1"/>
                                <div className="flex items-center gap-2 px-4">
                                    <Link href={`/`} className="hidden lg:inline-flex">
                                        <Button variant="ghost"
                                                className="flex items-center gap-2 text-primary/80 hover:text-primary text-md">
                                            Browse Events
                                        </Button>
                                    </Link>

                                    {userIsAdmin && (
                                        <Link href={`/manage/admin`} className="hidden lg:inline-flex">
                                            <Button variant="ghost"
                                                    className="flex items-center gap-2 text-primary/80 hover:text-primary text-md">
                                                <ShieldCheck className="size-4 mr-1"/>
                                                Admin Console
                                            </Button>
                                        </Link>
                                    )}

                                    <ModeToggle/>
                                    <Separator
                                        orientation="vertical"
                                        className="data-[orientation=vertical]:h-4"/>
                                    <Button
                                        variant={'ghost'}
                                    >
                                        <Bell size={16}/>
                                    </Button>
                                </div>
                            </div>
                        </header>
                        {!isAuthenticated && (
                            <div className="my-4 mx-auto w-full max-w-3xl">
                                <Notice
                                    title={"Authentication Required"}
                                    message={"Please log in to access organization management features."}
                                    submessage={" If you believe this is an error, contact support."}
                                />
                            </div>
                        )}
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </OrganizationProvider>
        </LimitProvider>
    )
}
