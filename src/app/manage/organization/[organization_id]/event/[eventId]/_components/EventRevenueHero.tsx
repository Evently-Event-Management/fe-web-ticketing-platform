"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {cn, formatCurrency} from "@/lib/utils";
import {Share2} from "lucide-react";
import {useEventContext} from "@/providers/EventProvider";
import {toast} from "sonner";
import {animate} from "framer-motion";

const useAnimatedNumber = (value: number | null, duration = 0.6) => {
    const [displayValue, setDisplayValue] = useState(() => value ?? 0);
    const previousValueRef = useRef<number>(value ?? 0);

    useEffect(() => {
        if (value === null || value === undefined) {
            setDisplayValue(0);
            previousValueRef.current = 0;
            return;
        }

        const controls = animate(previousValueRef.current, value, {
            duration,
            ease: "easeOut",
            onUpdate: latest => setDisplayValue(latest),
        });

        return () => {
            controls.stop();
        };
    }, [value, duration]);

    useEffect(() => {
        previousValueRef.current = displayValue;
    }, [displayValue]);

    return displayValue;
};

const formatTimestamp = (timestamp?: Date | null) => {
    if (!timestamp) {
        return null;
    }
    try {
        return new Intl.DateTimeFormat("en-LK", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(timestamp);
    } catch (error) {
        console.error("Failed to format timestamp", error);
        return timestamp.toLocaleTimeString();
    }
};

export const EventRevenueHero: React.FC = () => {
    const {
        event,
        organization,
        liveRevenueTotal,
        liveTicketsSold,
        lastRevenueUpdateAt,
    } = useEventContext();

    const coverPhotoUrl = event?.coverPhotos?.[0];
    const eventTitle = event?.title ?? "Event performance";
    const organizationName = organization?.name ?? event?.organizationName ?? "your organization";

    const resolvedRevenue = typeof liveRevenueTotal === "number" ? liveRevenueTotal : null;
    const resolvedTickets = typeof liveTicketsSold === "number" ? liveTicketsSold : null;
    const animatedRevenue = useAnimatedNumber(resolvedRevenue);
    const animatedTickets = useAnimatedNumber(resolvedTickets);

    const shareUrl = useMemo(() => {
        if (!event?.id) {
            return null;
        }
        if (typeof window !== "undefined") {
            return `${window.location.origin}/events/${event.id}`;
        }
        return `/events/${event.id}`;
    }, [event?.id]);

    const handleShare = useCallback(async () => {
        if (!shareUrl) {
            return;
        }

        const title = eventTitle;
        const text = `Have a look at ${eventTitle}`;

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({title, text, url: shareUrl});
                toast.success("Shared successfully");
                return;
            } catch (error) {
                console.warn("Share dismissed", error);
            }
        }

        if (typeof navigator !== "undefined" && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied to clipboard");
                return;
            } catch (error) {
                console.error("Failed to copy link", error);
            }
        }

        toast.error("Sharing isn't supported in this browser");
    }, [eventTitle, shareUrl]);

    const lastUpdateTime = formatTimestamp(lastRevenueUpdateAt);

    return (
        <section
            className={cn(
                "relative overflow-hidden rounded-3xl border border-border/70 shadow-lg",
                "bg-neutral-900"
            )}
        >
            <div className="absolute inset-0">
                {coverPhotoUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{backgroundImage: `url(${coverPhotoUrl})`}}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-primary/40 to-primary/30"/>
                )}
                <div className="absolute inset-0 bg-black/70"/>
            </div>

            <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 text-white">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4 max-w-2xl">
                        <Badge
                            variant="outline"
                            className="border-white/30 bg-white/10 text-white backdrop-blur"
                        >
                            Live event revenue
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                {eventTitle}
                            </h1>
                            <p className="text-sm sm:text-base text-white/75">
                                Tracking sales momentum for {organizationName}. Revenue updates stream in automatically from live orders.
                            </p>
                        </div>
                        {lastUpdateTime && (
                            <span className="text-xs text-white/70">
                                Last update received at {lastUpdateTime}
                            </span>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 border border-white/30 bg-white/15 text-white transition hover:bg-white/25"
                        disabled={!shareUrl}
                    >
                        <Share2 className="h-4 w-4"/>
                        Share event page
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                        <span className="text-sm font-medium text-white/80">Live revenue</span>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {resolvedRevenue === null
                                ? "--"
                                : formatCurrency(animatedRevenue, "LKR", "en-LK")}
                        </p>
                        <span className="mt-2 block text-xs text-white/70">
                            Total gross revenue confirmed across all sessions.
                        </span>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                        <span className="text-sm font-medium text-white/80">Tickets sold</span>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {resolvedTickets === null
                                ? "--"
                                : Math.round(animatedTickets).toLocaleString("en-LK")}
                        </p>
                        <span className="mt-2 block text-xs text-white/70">
                            Confirmed tickets issued for this event.
                        </span>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                        <span className="text-sm font-medium text-white/80">Streaming status</span>
                        <div className="mt-3 flex items-center gap-3 text-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-300/70 blur-[1px]"/>
                                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]"/>
                            </span>
                            <span className="text-white/80">Revenue streaming is active</span>
                        </div>
                        <span className="mt-2 block text-xs text-white/70">
                            New checkouts update these metrics in real time via server-sent events.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
