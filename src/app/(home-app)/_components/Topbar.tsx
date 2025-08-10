'use client'

import Link from 'next/link'
import {useAuth} from '@/providers/AuthProvider'
import {Ticket, ShieldCheck} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {ModeToggle} from "@/components/ModeToggle";
import * as React from "react";

export default function Topbar() {
    const {isAuthenticated, keycloak, isAdmin} = useAuth()
    const username = keycloak.tokenParsed?.name || 'User'
    const userIsAdmin = isAdmin()

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
            <div className="container flex h-12 items-center">
                <div className="mr-4 flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <div className="flex items-center gap-2 p-3 text-primary">
                            <Ticket className="size-6 text-primary"/>
                            <span className="text-xl font-bold">Ticketly</span>
                        </div>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <ModeToggle/>
                    {isAuthenticated ? (
                        <>
                            <Link href={`/manage/organization`} className="hidden lg:inline-flex">
                                <Button variant="ghost"
                                        className="flex items-center gap-2 text-primary/80 hover:text-primary text-md">
                                    Create Events
                                </Button>
                            </Link>
                            
                            {userIsAdmin && (
                                <Link href={`/manage/admin`} className="hidden lg:inline-flex">
                                    <Button variant="ghost"
                                            className="flex items-center gap-2 text-primary/80 hover:text-primary text-md">
                                        <ShieldCheck className="size-4 mr-1" />
                                        Admin Console
                                    </Button>
                                </Link>
                            )}
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="hidden lg:inline">{username}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {userIsAdmin && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/manage/admin" className="flex items-center gap-2">
                                                    <ShieldCheck className="size-4" />
                                                    Admin Console
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem onClick={() => keycloak.logout()}>
                                        Logout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => keycloak.accountManagement()}>
                                        Manage Account
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" className="hidden lg:inline-flex"
                                    onClick={() => keycloak.login()}>
                                Login
                            </Button>
                            <Button onClick={() => keycloak.register()}>
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
