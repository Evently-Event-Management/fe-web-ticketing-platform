"use client"

import React from "react";
import { DeviceBreakdown } from "@/types/eventAnalytics";
import {Pie, PieChart, Cell, Label} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
} from "@/components/ui/chart";
import { Laptop, Smartphone, Tablet, HelpCircle } from "lucide-react";

const chartConfig = {
    desktop: { label: "Desktop", color: "var(--color-chart-1)", icon: Laptop },
    mobile: { label: "Mobile", color: "var(--color-chart-2)", icon: Smartphone },
    tablet: { label: "Tablet", color: "var(--color-chart-3)", icon: Tablet },
    other: { label: "Other", color: "var(--color-chart-4)", icon: HelpCircle },
    unknown: { label: "Unknown", color: "var(--color-chart-5)", icon: HelpCircle },
} satisfies ChartConfig;

export const DeviceBreakdownChart: React.FC<{ data: DeviceBreakdown[] }> = ({ data }) => {

    const totalViews = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.views, 0)
    }, [data])

    const normalizedData = data.map((d) => ({
        ...d,
        device: d.device.toLowerCase(),
        fill:
            chartConfig[d.device.toLowerCase() as keyof typeof chartConfig]?.color ??
            chartConfig.other.color,
    }))

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Views by Device</CardTitle>
                <CardDescription>
                    Breakdown of devices used to view your event page.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="views"
                            nameKey="device"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {normalizedData.map((entry) => (
                                <Cell key={`cell-${entry.device}`} fill={entry.fill} />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalViews.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Views
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                        {/* Custom Legend with Icons */}
                        <ChartLegend
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center gap-4 mt-4">
                                    {payload?.map((entry) => {
                                        const deviceKey = entry.value as keyof typeof chartConfig;
                                        const Icon = chartConfig[deviceKey]?.icon ?? chartConfig.unknown.icon;
                                        return (
                                            <li key={deviceKey} className="flex items-center gap-2 text-sm">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                <span>{chartConfig[deviceKey]?.label ?? "Other"}</span>
                                                <span className="font-medium text-foreground">
                                                    ({data.find(d => d.device === entry.value)?.views ?? 0})
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
