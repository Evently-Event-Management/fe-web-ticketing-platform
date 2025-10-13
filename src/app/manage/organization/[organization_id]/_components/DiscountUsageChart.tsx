"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {Skeleton} from "@/components/ui/skeleton";
import {formatCurrency} from "@/lib/utils";
import {DiscountUsage} from "@/lib/actions/analyticsActions";

interface DiscountUsageChartProps {
    data: DiscountUsage[];
    currency?: string;
    locale?: string;
    isLoading?: boolean;
}

const toDateLabel = (date: string, locale: string) => {
    try {
        return new Date(date).toLocaleDateString(locale, {month: "short", day: "numeric"});
    } catch {
        return date;
    }
};

export const DiscountUsageChart: React.FC<DiscountUsageChartProps> = ({
    data,
    currency = "LKR",
    locale = "en-LK",
    isLoading = false,
}) => {
    const aggregated = useMemo(() => {
        const byDate = data.reduce<Record<string, {amount: number; count: number}>>((acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = {amount: 0, count: 0};
            }
            acc[item.date].amount += item.total_discount_amount;
            acc[item.date].count += item.usage_count;
            return acc;
        }, {});

        return Object.entries(byDate)
            .map(([date, value]) => ({
                date,
                label: toDateLabel(date, locale),
                totalDiscount: value.amount,
                redemptions: value.count,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [data, locale]);

    const chartConfig: ChartConfig = {
        totalDiscount: {
            label: "Discount given",
            color: "var(--color-chart-3)",
        },
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Discount traction</CardTitle>
                <CardDescription>
                    Track how much value customers are redeeming from promotions.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] flex-col justify-center">
                {isLoading ? (
                    <Skeleton className="h-[260px] w-full"/>
                ) : aggregated.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No discount activity yet.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={aggregated} margin={{left: 16, right: 16, top: 12, bottom: 8}}>
                            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/60"/>
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8}/>
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value, currency, locale).replace(/\.00$/, "")}
                            />
                            <ChartTooltip
                                cursor={{fill: "var(--color-chart-3)/10"}}
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number, currency, locale)}/>}
                            />
                            <Bar dataKey="totalDiscount" fill="var(--color-chart-3)" radius={[8, 8, 0, 0]}/>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};
