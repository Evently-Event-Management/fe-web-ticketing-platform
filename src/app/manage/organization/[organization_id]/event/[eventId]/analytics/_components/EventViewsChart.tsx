"use client"

import { TimeSeriesData } from "@/types/eventAnalytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { format, parse } from "date-fns";

const chartConfig = {
    views: {
        label: "Page Views",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

// Format "YYYYMMDD" → "MMM dd"
const formatAxisDate = (dateStr: string) => {
    const date = parse(dateStr, "yyyyMMdd", new Date());
    return format(date, "MMM dd");
};

export const EventViewsChart: React.FC<{ data: TimeSeriesData[] }> = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Page Views Trend</CardTitle>
                <CardDescription>Daily event page views (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 12, top: 20, bottom: 8 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatAxisDate}
                        />
                        <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8}
                            domain={['auto', 'auto']} 
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Line
                            dataKey="views"
                            type="monotone"
                            stroke="var(--color-chart-1)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
