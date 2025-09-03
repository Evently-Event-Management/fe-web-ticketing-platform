import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsCardProps = {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    secondaryValue?: string | number;
    secondaryLabel?: string;
    isLoading?: boolean;
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    secondaryValue,
    secondaryLabel,
    isLoading = false
}) => {
    if (isLoading) {
        return <Skeleton className="h-full w-full" />;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold space-y-2">
                    {value}
                    {secondaryValue && (
                        <span className="text-sm font-normal text-muted-foreground"> / {secondaryValue}</span>
                    )}
                </div>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                {secondaryLabel && <p className="text-xs text-muted-foreground">{secondaryLabel}</p>}
            </CardContent>
        </Card>
    );
};