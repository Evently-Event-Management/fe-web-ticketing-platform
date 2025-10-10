"use client";

import React, {useState, useMemo} from "react";
import {TierSales} from "@/types/eventAnalytics";
import { TierSalesMetrics } from "@/lib/actions/analyticsActions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from "@/components/ui/chart";
import {PieChart, Pie, Cell, Label} from "recharts";
import {formatCurrency} from "@/lib/utils";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {DollarSign, Ticket} from "lucide-react";

export const TierSalesChart: React.FC<{ data: TierSales[] | TierSalesMetrics[] }> = ({data}) => {
    const [mode, setMode] = useState<"revenue" | "tickets">("revenue");

    // Process data to normalize between TierSales and TierSalesMetrics
    const processedData = useMemo(() => {
        return data.map(tier => {
            // Check if it's a TierSalesMetrics object by checking for tier_id property
            if ('tier_id' in tier) {
                return {
                    tierId: tier.tier_id,
                    tierName: tier.tier_name,
                    tierColor: tier.tier_color,
                    ticketsSold: tier.tickets_sold,
                    revenue: tier.revenue
                };
            }
            // It's already in TierSales format
            return {
                tierId: tier.tierId,
                tierName: tier.tierName,
                tierColor: tier.tierColor,
                ticketsSold: tier.ticketsSold,
                revenue: tier.totalRevenue
            };
        });
    }, [data]);

    const chartConfig = processedData.reduce(
        (acc, tier) => {
            acc[tier.tierName] = {
                label: tier.tierName,
                color: tier.tierColor,
            };
            return acc;
        },
        {} as ChartConfig
    );

    const totalValue = useMemo(() => {
        return processedData.reduce(
            (acc, curr) =>
                acc + (mode === "revenue" ? curr.revenue : curr.ticketsSold),
            0
        );
    }, [processedData, mode]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
                <div>
                    <CardTitle>Sales by Tier</CardTitle>
                    <CardDescription>
                        Breakdown of sales by ticket type
                    </CardDescription>
                </div>

                {/* Toggle aligned right */}
                <ToggleGroup
                    type="single"
                    value={mode}
                    onValueChange={(val) => val && setMode(val as "revenue" | "tickets")}
                    className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
                >
                    <ToggleGroupItem
                        value="revenue"
                        aria-label="By Revenue"
                        className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow"
                    >
                        <DollarSign className="h-4 w-4"/>
                        Revenue
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="tickets"
                        aria-label="By Tickets"
                        className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow"
                    >
                        <Ticket className="h-4 w-4"/>
                        Tickets
                    </ToggleGroupItem>
                </ToggleGroup>
            </CardHeader>

            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <Pie
                            data={processedData}
                            dataKey={mode === "revenue" ? "revenue" : "ticketsSold"}
                            nameKey="tierName"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {processedData.map((entry) => (
                                <Cell key={`cell-${entry.tierId}`} fill={entry.tierColor}/>
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
                                                    {mode === "revenue"
                                                        ? formatCurrency(totalValue, "LKR", "en-LK").split(
                                                            "."
                                                        )[0]
                                                        : totalValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {mode === "revenue"
                                                        ? "Total Revenue"
                                                        : "Tickets Sold"}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
