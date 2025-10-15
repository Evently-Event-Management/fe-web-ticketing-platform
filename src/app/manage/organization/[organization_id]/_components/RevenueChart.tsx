"use client";

import React, {useMemo, useState} from "react";
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

const CHART_CONFIG = {
    revenue: {
        label: "Revenue",
        color: "var(--color-chart-1)",
    },
    tickets: {
        label: "Tickets sold",
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

    const totals = useMemo(() => ({
        revenue: data.reduce((acc, item) => acc + item.revenue, 0),
        tickets: data.reduce((acc, item) => acc + item.tickets_sold, 0),
    }), [data]);

    const [activeMetric, setActiveMetric] = useState<keyof typeof totals>("revenue");

    const formatMetricTotal = (metric: keyof typeof totals, value: number): string => {
        if (metric === "revenue") {
            return formatCurrency(value, currency, locale);
        }
        return value.toLocaleString(locale);
    };

    const formatActiveValue = (value: number): string => {
        if (activeMetric === "revenue") {
            return formatCurrency(value, currency, locale);
        }
        return value.toLocaleString(locale);
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-stretch gap-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1 px-6">
                    <CardTitle>Sales velocity</CardTitle>
                    <CardDescription>Track daily revenue and ticket momentum</CardDescription>
                </div>
                <div className="flex">
                    {(["revenue", "tickets"] as (keyof typeof totals)[]).map(key => (
                        <button
                            key={key}
                            type="button"
                            data-active={activeMetric === key}
                            className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left text-sm even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveMetric(key)}
                        >
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">
                                {CHART_CONFIG[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none text-foreground sm:text-3xl">
                                {formatMetricTotal(key, totals[key])}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex h-[360px] flex-col justify-center px-2 sm:px-6">
                {isLoading ? (
                    <Skeleton className="h-[240px] w-full"/>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No sales data available yet.
                    </div>
                ) : (
                    <ChartContainer config={CHART_CONFIG} className="h-full w-full">
                        <LineChart data={chartData} margin={{left: 12, right: 12, top: 12, bottom: 8}}>
                            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/60"/>
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}/>
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tickFormatter={(value) => formatActiveValue(value).replace(/\.00$/, "")}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent
                                    formatter={(value) => formatActiveValue(value as number)}
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
                                type="monotone"
                                dataKey={activeMetric}
                                stroke={`var(--color-${activeMetric})`}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{r: 5}}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};
