"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, TooltipProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"
import { TierSales } from "@/types/eventAnalytics";

// ++ 1. CREATE A CUSTOM TOOLTIP COMPONENT ++
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        // All data for the bar is in the first item's payload
        const data = payload[0].payload;

        return (
            <div className="min-w-36 space-y-2 p-2 bg-background border rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.tierColor }} />
                    <p className="font-bold text-foreground">{data.tierName}</p>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Sold</span>
                    <span className="font-medium text-foreground">{data.ticketsSold}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Unsold</span>
                    <span className="font-medium text-foreground">{data.unsold}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium text-foreground">{data.tierCapacity}</span>
                </div>
            </div>
        );
    }
    return null;
};

// Define the props for the component
interface TierDistributionChartProps {
    data: TierSales[];
}

export function TierDistributionChart({ data }: TierDistributionChartProps) {
    // Data transformation and chartConfig remain the same
    const chartData = React.useMemo(() => data.map(tier => ({
        name: tier.tierName,
        sold: tier.ticketsSold,
        unsold: tier.tierCapacity - tier.ticketsSold,
        ...tier,
    })), [data]);

    const chartConfig = {
        sold: { label: "Sold" },
        unsold: { label: "Unsold" },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tier Capacity & Sales</CardTitle>
                <CardDescription>A breakdown of sold vs. unsold tickets for each tier.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={5}
                                width={80}
                            />
                            <XAxis type="number" />

                            {/* ++ 2. USE THE CUSTOM TOOLTIP COMPONENT ++ */}
                            <ChartTooltip
                                cursor={{ fill: "hsl(var(--accent))" }}
                                content={<CustomTooltip />} // Pass the new component here
                            />

                            {/* Bars remain the same */}
                            <Bar dataKey="sold" stackId="a" radius={[4, 0, 0, 4]}>
                                {chartData.map((tier) => (
                                    <Cell key={`cell-sold-${tier.tierId}`} fill={tier.tierColor} />
                                ))}
                            </Bar>
                            <Bar dataKey="unsold" stackId="a" radius={[0, 4, 4, 0]}>
                                {chartData.map((tier) => (
                                    <Cell key={`cell-unsold-${tier.tierId}`} fill={`${tier.tierColor}40`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}