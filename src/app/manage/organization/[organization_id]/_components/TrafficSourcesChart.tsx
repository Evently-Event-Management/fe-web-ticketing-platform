"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {TrafficSource} from "@/types/eventAnalytics";
import {Skeleton} from "@/components/ui/skeleton";

interface TrafficSourcesChartProps {
    data: TrafficSource[];
    totalViews: number;
    isLoading?: boolean;
}

const CHART_CONFIG: ChartConfig = {
    views: {
        label: "Views",
        color: "var(--color-chart-3)",
    },
};

const mapTrafficLabel = (source: string, medium: string): string => {
    const cleanSource = source && source.toLowerCase() !== "(not set)" ? source : "Unknown";
    const cleanMedium = medium && medium.toLowerCase() !== "(not set)" ? medium : "Direct";
    return `${cleanSource} / ${cleanMedium}`;
};

export const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({data, totalViews, isLoading = false}) => {
    const chartData = useMemo(() => {
        if (!data?.length) {
            return [] as Array<{label: string; views: number}>;
        }
        return data.map(item => ({
            label: mapTrafficLabel(item.source, item.medium),
            views: item.views,
        }));
    }, [data]);

    const total = useMemo(() => data.reduce((sum, entry) => sum + entry.views, 0), [data]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Top traffic sources</CardTitle>
                <CardDescription>Where ticket buyers discover your events</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] flex-col justify-between gap-6">
                {isLoading ? (
                    <Skeleton className="h-[240px] w-full"/>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No traffic source data available yet.
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline justify-between text-sm">
                            <span className="text-muted-foreground">Attributed views</span>
                            <span className="font-semibold text-foreground">{totalViews.toLocaleString("en-LK")}</span>
                        </div>
                        <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full">
                            <BarChart data={chartData} margin={{left: 12, right: 12, top: 8, bottom: 4}}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-border/60"/>
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    angle={-20}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tickLine={false} axisLine={false} allowDecimals={false}/>
                                <ChartTooltip
                                    content={<ChartTooltipContent
                                        formatter={(value) => {
                                            const numeric = Number(value) || 0;
                                            return `${numeric.toLocaleString("en-LK")} views`;
                                        }}
                                    />}
                                />
                                <Bar
                                    dataKey="views"
                                    radius={[6, 6, 0, 0]}
                                    fill="var(--color-views)"
                                />
                            </BarChart>
                        </ChartContainer>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            {chartData.map(entry => {
                                const percent = total === 0 ? 0 : Math.round((entry.views / total) * 100);
                                return (
                                    <div key={entry.label} className="flex items-center justify-between">
                                        <span className="truncate pr-2" title={entry.label}>{entry.label}</span>
                                        <span className="font-medium text-foreground">{percent}%</span>
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
