"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts";
import {TimeSeriesData} from "@/types/eventAnalytics";
import {Skeleton} from "@/components/ui/skeleton";

interface AudienceViewsChartProps {
    data: TimeSeriesData[];
    totalViews: number;
    isLoading?: boolean;
}

const CHART_CONFIG = {
    views: {
        label: "Daily views",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig;

const formatDate = (isoDate: string): string => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
        return isoDate;
    }
    return parsed.toLocaleDateString("en-US", {month: "short", day: "numeric"});
};

export const AudienceViewsChart: React.FC<AudienceViewsChartProps> = ({data, totalViews, isLoading = false}) => {
    const chartData = useMemo(() => data.map(point => ({
        date: formatDate(point.date),
        rawDate: point.date,
        views: point.views,
    })), [data]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Audience views</CardTitle>
                <CardDescription>Event impressions over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] flex-col justify-center gap-4">
                {isLoading ? (
                    <Skeleton className="h-[260px] w-full"/>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Google Analytics hasn&apos;t recorded views yet.
                    </div>
                ) : (
                    <React.Fragment>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Total views (30 days)</span>
                            <span className="font-semibold text-foreground">{totalViews.toLocaleString("en-LK")}</span>
                        </div>
                        <ChartContainer config={CHART_CONFIG} className="h-full w-full">
                            <LineChart data={chartData} margin={{left: 12, right: 12, top: 4, bottom: 0}}>
                                <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/60"/>
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}/>
                                <YAxis tickLine={false} axisLine={false} allowDecimals={false}/>
                                <ChartTooltip
                                    content={<ChartTooltipContent
                                        nameKey="views"
                                        labelFormatter={(label) => {
                                            const point = chartData.find(item => item.date === label);
                                            if (!point) {
                                                return label;
                                            }
                                            const fullDate = new Date(point.rawDate);
                                            return fullDate.toLocaleDateString("en-LK", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            });
                                        }}
                                    />}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="var(--color-chart-2)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{r: 4}}
                                />
                            </LineChart>
                        </ChartContainer>
                    </React.Fragment>
                )}
            </CardContent>
        </Card>
    );
};
