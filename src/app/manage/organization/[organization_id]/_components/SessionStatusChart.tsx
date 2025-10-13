"use client";

import React, {useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Cell, Pie, PieChart} from "recharts";
import {SessionStatus} from "@/types/enums/sessionStatus";
import {SessionAnalyticsResponse} from "@/lib/actions/statsActions";
import {Skeleton} from "@/components/ui/skeleton";

interface SessionStatusChartProps {
    analytics: SessionAnalyticsResponse | null;
    totals: Record<SessionStatus, number>;
    isLoading?: boolean;
}

const STATUS_LABELS: Record<SessionStatus, string> = {
    [SessionStatus.PENDING]: "Pending",
    [SessionStatus.SCHEDULED]: "Scheduled",
    [SessionStatus.ON_SALE]: "On sale",
    [SessionStatus.SOLD_OUT]: "Sold out",
    [SessionStatus.CLOSED]: "Closed",
    [SessionStatus.CANCELED]: "Canceled",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
    [SessionStatus.PENDING]: "var(--color-chart-5)",
    [SessionStatus.SCHEDULED]: "var(--color-chart-1)",
    [SessionStatus.ON_SALE]: "var(--color-chart-2)",
    [SessionStatus.SOLD_OUT]: "var(--color-chart-3)",
    [SessionStatus.CLOSED]: "var(--color-chart-4)",
    [SessionStatus.CANCELED]: "var(--color-chart-6)",
};

export const SessionStatusChart: React.FC<SessionStatusChartProps> = ({
    analytics,
    totals,
    isLoading = false,
}) => {
    const chartData = useMemo(() => (
        Object.entries(totals)
            .map(([status, count]) => ({
                status: status as SessionStatus,
                count,
                label: STATUS_LABELS[status as SessionStatus],
            }))
            .filter(item => item.count > 0)
    ), [totals]);

    const chartConfig = useMemo<ChartConfig>(() => (
        Object.values(SessionStatus).reduce<ChartConfig>((acc, status) => {
            acc[STATUS_LABELS[status]] = {
                label: STATUS_LABELS[status],
                color: STATUS_COLORS[status],
            };
            return acc;
        }, {})
    ), []);

    const totalSessions = analytics?.totalSessions ?? chartData.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Session status mix</CardTitle>
                <CardDescription>
                    {totalSessions === 0 ? "No sessions yet" : `${totalSessions} active sessions tracked`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] flex-col items-center justify-center">
                {isLoading ? (
                    <Skeleton className="h-[220px] w-full"/>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No session status data available.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="55%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} strokeWidth={2}/>
                                ))}
                            </Pie>
                            <ChartTooltip
                                content={<ChartTooltipContent
                                    formatter={(value, name) => [`${value} sessions`, name]}
                                />}
                            />
                            <ChartLegend
                                verticalAlign="bottom"
                                content={<ChartLegendContent nameKey="label"/>}
                            />
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};
