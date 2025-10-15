"use client";

import React from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {RefreshCw} from "lucide-react";
import {cn, formatCurrency} from "@/lib/utils";

interface EventRevenueHeroProps {
    eventTitle: string;
    coverPhotoUrl?: string;
    organizationName?: string;
    totalRevenue?: number;
    totalTickets?: number;
    isLoading?: boolean;
    isRefreshing?: boolean;
    hasPendingUpdate?: boolean;
    pendingRevenueDelta?: number;
    pendingTicketCount?: number;
    lastUpdatedAt?: Date | null;
    onRefresh: () => void;
}

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

export const EventRevenueHero: React.FC<EventRevenueHeroProps> = ({
    eventTitle,
    coverPhotoUrl,
    organizationName,
    totalRevenue = 0,
    totalTickets = 0,
    isLoading = false,
    isRefreshing = false,
    hasPendingUpdate = false,
    pendingRevenueDelta = 0,
    pendingTicketCount = 0,
    lastUpdatedAt,
    onRefresh,
}) => {
    const pendingRevenueText = pendingRevenueDelta > 0
        ? `+${formatCurrency(pendingRevenueDelta, "LKR", "en-LK")}`
        : null;

    const pendingTicketsText = pendingTicketCount > 0
        ? `+${pendingTicketCount.toLocaleString("en-LK")} tickets`
        : null;

    const lastUpdateTime = formatTimestamp(lastUpdatedAt);

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
                            Live event analytics
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                {eventTitle}
                            </h1>
                            <p className="text-sm sm:text-base text-white/75">
                                Monitoring performance for {organizationName ?? "your organization"}. Stay on top of ticket sales and revenue in real-time.
                            </p>
                        </div>
                        {(hasPendingUpdate || lastUpdateTime) && (
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                                {hasPendingUpdate && (
                                    <div className="flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/80"/>
                                            <span className="relative h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.9)]"/>
                                        </span>
                                        <span className="font-medium">New revenue detected</span>
                                        {pendingRevenueText && <span>{pendingRevenueText}</span>}
                                        {pendingTicketsText && <span>• {pendingTicketsText}</span>}
                                    </div>
                                )}
                                {lastUpdateTime && (
                                    <span className="text-xs text-white/70">
                                        Latest update received at {lastUpdateTime}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Refresh event analytics"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={cn(
                            "h-12 w-12 rounded-full border border-white/30 bg-white/15 text-white transition",
                            hasPendingUpdate && !isRefreshing && "border-emerald-300 shadow-[0_0_20px_rgba(167,243,208,0.6)]",
                        )}
                    >
                        <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")}/>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                        <span className="text-sm font-medium text-white/80">Live revenue</span>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {isLoading
                                ? "--"
                                : formatCurrency(totalRevenue, "LKR", "en-LK")}
                        </p>
                        <span className="mt-2 block text-xs text-white/70">
                            Combined revenue across all approved sessions for this event.
                        </span>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                        <span className="text-sm font-medium text-white/80">Tickets sold</span>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {isLoading
                                ? "--"
                                : totalTickets.toLocaleString("en-LK")}
                        </p>
                        <span className="mt-2 block text-xs text-white/70">
                            Total tickets confirmed across all sessions.
                        </span>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                        <span className="text-sm font-medium text-white/80">Refresh status</span>
                        <div className="mt-3 flex items-center gap-3 text-sm">
                            <span className={cn(
                                "flex h-2.5 w-2.5 rounded-full",
                                isRefreshing
                                    ? "bg-white animate-pulse"
                                    : hasPendingUpdate
                                        ? "bg-emerald-300 animate-pulse"
                                        : "bg-white/60"
                            )}/>
                            <span className="text-white/80">
                                {isRefreshing
                                    ? "Refreshing analytics..."
                                    : hasPendingUpdate
                                        ? "New data available — refresh to sync"
                                        : "All analytics are up to date"}
                            </span>
                        </div>
                        <span className="mt-2 block text-xs text-white/70">
                            Revenue updates stream in live. Use the refresh button to sync detailed analytics.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
