"use client";

import {TierSales} from "@/types/eventAnalytics";
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
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {formatCurrency} from "@/lib/utils";

export const TierSalesChart: React.FC<{ data: TierSales[] }> = ({data}) => {
    // build config for shadcn chart block
    const chartConfig = data.reduce(
        (acc, tier) => {
            acc[tier.tierName] = {
                label: tier.tierName,
                color: tier.tierColor,
            };
            return acc;
        },
        {} as Record<string, { label: string; color: string }>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue by Tier</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                dataKey="totalRevenue"
                                nameKey="tierName"
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.tierId}`}
                                        fill={entry.tierColor}
                                    />
                                ))}
                            </Pie>

                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, _, {payload}) => {
                                            if (!payload) return null;
                                            return (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex flex-col">
                                                        <span
                                                            className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Tier
                                                        </span>
                                                        <span className="font-bold">
                                                            {payload.tierName}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span
                                                            className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Revenue
                                                        </span>
                                                        <span className="font-bold">
                                                            {formatCurrency(
                                                                payload.totalRevenue,
                                                                "LKR",
                                                                "en-LK"
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                }
                            />

                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
