"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Line, LineChart, XAxis, YAxis, CartesianGrid} from "recharts";
import {DailySalesMetrics} from "@/lib/actions/analyticsActions";
import {Skeleton} from "@/components/ui/skeleton";
import {formatCurrency} from "@/lib/utils";

interface RevenueChartProps {
    data: DailySalesMetrics[];
    currency?: string;
    locale?: string;
    isLoading?: boolean;
}

const DEFAULT_CHART_CONFIG = {
    revenue: {
        label: "Revenue",
        color: "var(--color-chart-1)",
    },
    tickets: {
        label: "Tickets Sold",
        color: "var(--color-chart-2)",
    },
} satisfies ChartConfig;

const formatDateLabel = (isoDate: string): string => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }
    return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
    data,
    currency = "LKR",
    locale = "en-LK",
    isLoading = false,
}) => {
    const chartData = useMemo(() => (
        data.map(item => ({
            date: formatDateLabel(item.date),
            rawDate: item.date,
            revenue: item.revenue,
            tickets: item.tickets_sold,
        }))
    ), [data]);

    const revenueTotal = useMemo(() => data.reduce((acc, item) => acc + item.revenue, 0), [data]);

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Sales velocity</CardTitle>
                        <CardDescription>Daily revenue and ticket movement</CardDescription>
                    </div>
                    {!isLoading && (
                        <span className="text-sm font-medium text-primary">
                            {formatCurrency(revenueTotal, currency, locale)} total
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex h-[320px] flex-col justify-center">
                {isLoading ? (
                    <Skeleton className="h-[260px] w-full"/>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No sales data available yet.
                    </div>
                ) : (
                    <ChartContainer config={DEFAULT_CHART_CONFIG} className="h-full w-full">
                        <LineChart data={chartData} margin={{left: 16, right: 16, top: 12, bottom: 8}}>
                            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/60"/>
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}/>
                            <YAxis
                                yAxisId="left"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value, currency, locale).replace(/\.00$/, "")}
                            />
                            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false}/>
                            <ChartTooltip
                                content={<ChartTooltipContent
                                    formatter={(value, name) => {
                                        if (name === "revenue") {
                                            return formatCurrency(value as number, currency, locale);
                                        }
                                        return `${value}`;
                                    }}
                                    labelFormatter={(label) => {
                                        const point = chartData.find(item => item.date === label);
                                        if (!point) {
                                            return label;
                                        }
                                        const fullDate = new Date(point.rawDate);
                                        return fullDate.toLocaleDateString(locale, {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                />}
                                cursor={{strokeDasharray: "4 2"}}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--color-chart-1)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{r: 4}}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="tickets"
                                stroke="var(--color-chart-2)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{r: 4}}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};
