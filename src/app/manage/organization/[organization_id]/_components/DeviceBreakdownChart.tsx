"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartLegend, ChartLegendContent} from "@/components/ui/chart";
import {Cell, Pie, PieChart} from "recharts";
import {DeviceBreakdown} from "@/types/eventAnalytics";
import {Skeleton} from "@/components/ui/skeleton";

interface DeviceBreakdownChartProps {
    data: DeviceBreakdown[];
    totalViews: number;
    isLoading?: boolean;
}

const DEVICE_CONFIG: ChartConfig = {
    Desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    Mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
    Tablet: {
        label: "Tablet",
        color: "var(--chart-3)",
    },
    Unknown: {
        label: "Unknown",
        color: "var(--chart-4)",
    },
};

const DEVICE_LABELS: Record<DeviceBreakdown["device"], string> = {
    Desktop: "Desktop",
    Mobile: "Mobile",
    Tablet: "Tablet",
    Unknown: "Unknown",
};

export const DeviceBreakdownChart: React.FC<DeviceBreakdownChartProps> = ({data, totalViews, isLoading = false}) => {
    const chartData = useMemo(() => {
        if (!data?.length) {
            return [];
        }
        return data.map(entry => ({
            ...entry,
            label: DEVICE_LABELS[entry.device] ?? entry.device,
        }));
    }, [data]);

    const total = useMemo(() => data.reduce((sum, item) => sum + item.views, 0), [data]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Device mix</CardTitle>
                <CardDescription>Where your viewers are browsing</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] flex-col justify-between gap-6">
                {isLoading ? (
                    <Skeleton className="h-[240px] w-full"/>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No device data available yet.
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline justify-between text-sm">
                            <span className="text-muted-foreground">Total views</span>
                            <span className="font-semibold text-foreground">{totalViews.toLocaleString("en-LK")}</span>
                        </div>
                        <ChartContainer config={DEVICE_CONFIG} className="mx-auto h-[200px] w-full">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="views"
                                    nameKey="label"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    strokeWidth={2}
                                >
                                    {chartData.map((entry) => (
                                        <Cell key={entry.label} fill={`var(--color-${entry.device})`}/>
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent/>} verticalAlign="bottom"/>
                            </PieChart>
                        </ChartContainer>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            {chartData.map(entry => {
                                const percentage = total === 0 ? 0 : Math.round((entry.views / total) * 100);
                                return (
                                    <div key={entry.device} className="flex items-center justify-between">
                                        <span>{entry.label}</span>
                                        <span className="font-medium text-foreground">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
