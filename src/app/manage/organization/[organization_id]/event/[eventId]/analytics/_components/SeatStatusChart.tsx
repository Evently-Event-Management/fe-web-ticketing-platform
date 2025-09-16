"use client"

import * as React from "react"
import {Pie, PieChart, Cell, Label} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer, ChartLegend,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {ReadModelSeatStatus} from "@/types/enums/readModelSeatStatus";

const statusConfig = {
    [ReadModelSeatStatus.AVAILABLE]: {label: "Available", color: "var(--color-chart-2)"},
    [ReadModelSeatStatus.BOOKED]: {label: "Booked", color: "var(--color-chart-1)"},
    [ReadModelSeatStatus.RESERVED]: {label: "Reserved", color: "var(--color-chart-4)"},
    [ReadModelSeatStatus.LOCKED]: {label: "Locked", color: "var(--color-chart-3)"},
} satisfies Record<ReadModelSeatStatus, { label: string; color: string }>


interface SeatStatusCardProps {
    seatStatusBreakdown: Record<ReadModelSeatStatus, number>;
}

export function SeatStatusChart({seatStatusBreakdown}: SeatStatusCardProps) {
    // 1. Transform the input object into an array for the chart
    const chartData = React.useMemo(() =>
        Object.entries(seatStatusBreakdown).map(([status, count]) => ({
            status: status as ReadModelSeatStatus,
            count: count,
            fill: statusConfig[status as ReadModelSeatStatus].color,
        })), [seatStatusBreakdown]);

    // 2. Dynamically generate the chart config for the legend and tooltip
    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {};
        chartData.forEach(item => {
            config[item.status] = {
                label: statusConfig[item.status].label,
                color: item.fill,
            };
        });
        return config;
    }, [chartData]);

    // 3. Calculate the total number of seats to display in the center
    const totalSeats = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.count, 0);
    }, [chartData]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
                <div>
                    <CardTitle>Seat Status</CardTitle>
                    <CardDescription>Breakdown of seat allocations</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="w-full aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={55} // This makes it a donut chart
                            strokeWidth={20}
                        >
                            {/* The <Cell> component is used to give each segment a unique color */}
                            {chartData.map((entry) => (
                                <Cell key={entry.status} fill={entry.fill}/>
                            ))}
                            <Label
                                content={({viewBox}) => {
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
                                                    className="fill-foreground text-lg font-bold"
                                                >
                                                    {totalSeats.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total Seats
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </Pie>
                        <ChartLegend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            height={36}
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{marginTop: 0, marginRight: 40}}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}