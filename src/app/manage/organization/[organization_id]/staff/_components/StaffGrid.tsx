"use client";

import React from "react";
import {OrganizationMemberResponse} from "@/types/oraganizations";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";
import {Trash2Icon, MailIcon, ShieldCheck, Power} from "lucide-react";
import {Switch} from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StaffGridProps {
    staffMembers: OrganizationMemberResponse[];
    isLoading: boolean;
    onRemove: (userId: string) => void;
    onToggleActive: (userId: string, nextState: boolean) => void;
}

const getInitials = (name?: string) => {
    if (!name || name === "null" || name === "null null") {
        return "?";
    }
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    const first = parts[0]?.[0];
    const second = parts[1]?.[0];
    return `${first ?? ""}${second ?? ""}`.toUpperCase();
};

const formatName = (name?: string) => {
    if (!name || name === "null" || name === "null null") {
        return "Pending invitation";
    }
    return name;
};

export const StaffGrid: React.FC<StaffGridProps> = ({staffMembers, isLoading, onRemove, onToggleActive}) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({length: 6}).map((_, index) => (
                    <Card key={`staff-skeleton-${index}`} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full"/>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40"/>
                                <Skeleton className="h-3 w-32"/>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-3 w-3/4"/>
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16"/>
                                <Skeleton className="h-6 w-20"/>
                            </div>
                            <Skeleton className="h-9 w-24"/>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (staffMembers.length === 0) {
        return (
            <Card className="border-dashed bg-muted/40">
                <CardHeader className="text-center">
                    <CardTitle className="text-lg">No staff members yet</CardTitle>
                    <CardDescription>
                        Invite your first teammate to help manage check-ins and sales.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staffMembers.map(member => {
                const name = formatName(member.name);
                const isInactive = !member.active;
                return (
                    <Card
                        key={member.userId}
                        className="relative overflow-hidden border border-border/60  shadow-sm transition hover:border-primary/50 hover:shadow-lg"
                    >
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.1),_transparent_60%)]"/>
                        <CardHeader className="flex flex-row items-start gap-4 pb-2">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <CardTitle className="text-xl font-semibold leading-tight">
                                    {name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 text-xs uppercase tracking-wide">
                                    <MailIcon className="h-3.5 w-3.5"/>
                                    {member.email}
                                </CardDescription>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive">
                                        <Trash2Icon className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Remove staff member</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to remove {member.email}? This action can&apos;t be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onRemove(member.userId)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Remove
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 pt-0">
                            <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-3 text-xs uppercase tracking-wide text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Power className={`h-3.5 w-3.5 ${member.active ? "text-emerald-500" : "text-amber-500"}`}/>
                                    <span className="font-semibold text-foreground">
                                        {member.active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <Switch
                                    checked={member.active}
                                    onCheckedChange={(checked) => onToggleActive(member.userId, checked)}
                                    aria-label={`Toggle access for ${member.email}`}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-primary"/>
                                <span className="font-medium uppercase tracking-wide">Access roles</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {member.roles.map(role => (
                                    <Badge key={role} variant="secondary" className="border border-border/50 bg-background/80">
                                        {role.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                                {member.roles.length === 0 && (
                                    <Badge variant="outline">No roles assigned</Badge>
                                )}
                            </div>
                            {isInactive ? (
                                <div className="rounded-lg border border-dashed border-amber-300/70 px-3 py-2 text-xs text-amber-600 dark:bg-amber-800/10 bg-amber-100/20">
                                    Access paused — reactivate once they&apos;re ready or after they accept the invite.
                                </div>
                            ) : (
                                <div className="rounded-lg border border-emerald-200/70 px-3 py-2 text-xs text-emerald-600 dark:bg-emerald-800/10 bg-emerald-100/20">
                                    This teammate can manage assigned duties and scan tickets right away.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
