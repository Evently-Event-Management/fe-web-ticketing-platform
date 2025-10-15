"use client";

import React from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Sparkles, ArrowRight, RockingChair} from "lucide-react";
import {cn, formatCurrency} from "@/lib/utils";

interface WelcomeBarProps {
    organizationName?: string;
    totalRevenue?: number;
    organizationId: string;
    isLoading?: boolean;
}

export const WelcomeBar: React.FC<WelcomeBarProps> = ({
    organizationName,
    totalRevenue,
    organizationId,
    isLoading = false,
}) => {
    return (
        <section className={cn(
            "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background",
            "p-6 sm:p-8 shadow-sm"
        )}>
            <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"/>
            <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"/>

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur text-primary border-primary/30">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5"/>
                        Welcome back
                    </Badge>
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            {isLoading
                                ? "Loading your organization..."
                                : `Hello, ${organizationName ?? "Organizer"}!`}
                        </h1>
                        <p className="max-w-xl text-sm sm:text-base text-muted-foreground">
                            Here&apos;s a snapshot of how your organization is performing today. Plan your next move,
                            launch a new event, or dive deeper into your analytics in a single place.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg" className="group">
                            <Link href={`/manage/organization/${organizationId}/event/create`}>
                                <Sparkles className="mr-2 h-4 w-4"/>
                                Launch new event
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href={`/manage/organization/${organizationId}/event`}>Browse events</Link>
                        </Button>
                        <Button asChild size="lg" variant="ghost" className="text-primary">
                            <Link href={`/manage/organization/${organizationId}/seating`}>
                                <RockingChair className="mr-2 h-4 w-4"/>
                                Manage seating layouts
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative isolate grid gap-4 rounded-2xl border border-primary/20 bg-background/90 p-6 shadow-lg backdrop-blur">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Total revenue generated</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            Live
                        </Badge>
                    </div>
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                        {isLoading
                            ? "--"
                            : formatCurrency(totalRevenue ?? 0, "LKR", "en-LK")}
                    </p>
                    <span className="text-xs text-muted-foreground">
                        Combined revenue across all approved events in your organization.
                    </span>
                </div>
            </div>
        </section>
    );
};
