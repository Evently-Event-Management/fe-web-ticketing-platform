"use client";

import {BlockOccupancy} from "@/types/eventAnalytics";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import React from "react";

export const BlockOccupancyChart: React.FC<{ data: BlockOccupancy[] }> = ({
                                                                              data,
                                                                          }) => {
    // define config for shadcn chart colors/labels
    const chartConfig = {
        occupancyPercentage: {
            label: "Occupancy",
            color: "hsl(var(--primary))",
        },
    };

    // filter block type 'none_sellable' if exists
    data = data.filter(block => block.blockType !== 'non_sellable');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Occupancy by Block</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                            />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <YAxis
                                dataKey="blockName"
                                type="category"
                                width={80}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ChartTooltip
                                cursor={{fill: "hsl(var(--muted))"}}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(label) => `${label}`}
                                        formatter={(_, __, {payload}) => {
                                            if (!payload) return null;
                                            return (
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <p className="font-bold">{payload.blockName}</p>
                                                    <p className="text-muted-foreground">
                                                        Sold:{" "}
                                                        <span className="font-medium text-foreground">
                                                            {payload.seatsSold} / {payload.totalCapacity}
                                                        </span>
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        Occupancy:{" "}
                                                        <span className="font-medium text-foreground">
                                                            {payload.occupancyPercentage.toFixed(1)}%
                                                        </span>
                                                    </p>
                                                </div>
                                            );
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="occupancyPercentage"
                                fill="var(--color-primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
