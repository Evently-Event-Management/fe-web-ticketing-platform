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
import {Bell} from "lucide-react";

export default function Layout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex justify-between w-full items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <div className="flex items-center gap-2 px-4">
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
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
