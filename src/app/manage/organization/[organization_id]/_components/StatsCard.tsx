"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import type {LucideIcon} from "lucide-react";
import {RefreshCcw} from "lucide-react";
import React from "react";

interface StatsCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon?: LucideIcon;
    trendLabel?: string;
    trendValue?: string;
    trendVariant?: "positive" | "negative" | "neutral" | "warning";
    isLoading?: boolean;
    className?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    refreshLabel?: string;
}

const trendVariantClasses: Record<Exclude<StatsCardProps["trendVariant"], undefined>, string> = {
    positive: "text-emerald-500",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
    warning: "text-amber-500",
};

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trendLabel,
    trendValue,
    trendVariant = "neutral",
    isLoading = false,
    className,
    onRefresh,
    isRefreshing = false,
    refreshLabel,
}) => {
    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none animate-gradient"/>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                            {title}
                        </CardTitle>
                        {isLoading ? (
                            <div className="mt-1 space-y-2">
                                <Skeleton className="h-8 w-32"/>
                                {subtitle && <Skeleton className="h-4 w-24"/>}
                            </div>
                        ) : (
                            <div>
                                <p className="text-3xl font-semibold tracking-tight text-foreground">
                                    {value}
                                </p>
                                {subtitle && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <Icon className="h-5 w-5"/>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-4 w-36"/>
                ) : trendLabel ? (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{trendLabel}</span>
                        {trendValue && (
                            <span className={cn("font-semibold", trendVariantClasses[trendVariant])}>
                                {trendValue}
                            </span>
                        )}
                    </div>
                ) : null}
            </CardContent>
            {onRefresh && (
                <button
                    type="button"
                    onClick={onRefresh}
                    aria-label={refreshLabel ?? `Refresh ${title}`}
                    disabled={isRefreshing}
                    className={cn(
                        "absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition hover:scale-105 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        isRefreshing && "cursor-not-allowed opacity-70"
                    )}
                >
                    <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")}/>
                </button>
            )}
        </Card>
    );
};
