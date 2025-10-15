"use client";

import React, {useEffect, useRef, useState} from "react";
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
    const [displayedRevenue, setDisplayedRevenue] = useState(totalRevenue ?? 0);
    const animationFrameRef = useRef<number | null>(null);
    const latestValueRef = useRef(displayedRevenue);

    useEffect(() => {
        latestValueRef.current = displayedRevenue;
    }, [displayedRevenue]);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const target = totalRevenue ?? 0;

        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (isLoading) {
            setDisplayedRevenue(target);
            return;
        }

        const startValue = latestValueRef.current;
        const difference = target - startValue;

        if (Math.abs(difference) < 0.01) {
            setDisplayedRevenue(target);
            latestValueRef.current = target;
            return;
        }

        const duration = 800;
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const nextValue = startValue + difference * easedProgress;
            setDisplayedRevenue(nextValue);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayedRevenue(target);
                latestValueRef.current = target;
                animationFrameRef.current = null;
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [totalRevenue, isLoading]);

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

                <div className="relative isolate grid gap-4 rounded-2xl border border-primary/20 bg-neutral-900/80 p-6 text-white shadow-lg backdrop-blur">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="text-white/80">Total revenue generated</span>
                        <Badge
                            variant="secondary"
                            className="border-white/40 bg-white/10 text-white/90 shadow-lg backdrop-blur-sm animate-pulse"
                        >
                            <span className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inset-0 rounded-full bg-emerald-400/80 blur-[1px]"/>
                                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"/>
                                    <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]"/>
                                </span>
                                Live
                            </span>
                        </Badge>
                    </div>
                    <p className="text-3xl font-semibold tracking-tight text-white">
                        {isLoading
                            ? "--"
                            : formatCurrency(displayedRevenue, "LKR", "en-LK")}
                    </p>
                    <span className="text-xs text-white/70">
                        Combined revenue across all approved events in your organization.
                    </span>
                </div>
            </div>
        </section>
    );
};
