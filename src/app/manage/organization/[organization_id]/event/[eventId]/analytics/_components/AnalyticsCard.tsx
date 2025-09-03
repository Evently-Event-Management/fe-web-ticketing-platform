import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

type AnalyticsCardProps = {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, subtitle, icon }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </CardContent>
        </Card>
    );
};