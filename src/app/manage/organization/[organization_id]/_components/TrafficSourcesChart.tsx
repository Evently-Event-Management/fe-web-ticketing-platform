"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, LabelList, YAxis} from "recharts";
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
                            <BarChart data={chartData} margin={{left: 12, right: 12, top: 36, bottom: 4}}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-border/60"/>
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
                                >
                                    <LabelList
                                        dataKey="label"
                                        position="top"
                                        className="fill-muted-foreground text-[11px] font-medium"
                                        formatter={(label: unknown) => {
                                            if (typeof label !== "string") {
                                                return label;
                                            }
                                            return label.length > 30 ? `${label.slice(0, 27)}…` : label;
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {chartData.map(entry => {
                                const percent = total === 0 ? 0 : Math.round((entry.views / total) * 100);
                                return (
                                    <div key={entry.label} className="flex items-center gap-1" title={entry.label}>
                                        <span className="font-medium text-foreground">{entry.label}</span>
                                        <span className="text-muted-foreground">{percent}%</span>
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
