"use client";

import React, { useState, useMemo } from "react";
import { DiscountUsage } from "@/lib/actions/analyticsActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DollarSign, Tag, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface DiscountUsageChartProps {
  data: DiscountUsage[];
}

export const DiscountUsageChart: React.FC<DiscountUsageChartProps> = ({ data }) => {
  // State for toggle between amount and usage count in pie chart
  const [pieMode, setPieMode] = useState<"amount" | "usage">("amount");

  // Chart colors from globals.css
    const chartColors = useMemo(
        () => [
            "var(--color-chart-1)", // Teal
            "var(--color-chart-2)", // Sky Blue
            "var(--color-chart-3)", // Indigo
            "var(--color-chart-4)", // Lime
            "var(--color-chart-5)", // Orange
        ],
        []
    );

    const discountsByCode = useMemo(() => {
        return data.reduce((acc, item) => {
            const code = item.discount_code;
            if (!acc[code]) {
                acc[code] = {
                    discount_code: code,
                    usage_count: 0,
                    total_discount_amount: 0,
                    color: chartColors[Object.keys(acc).length % chartColors.length],
                };
            }
            acc[code].usage_count += item.usage_count;
            acc[code].total_discount_amount += item.total_discount_amount;
            return acc;
        }, {} as Record<string, { discount_code: string; usage_count: number; total_discount_amount: number; color: string }>);
    }, [chartColors, data]);

  // Create pie chart data sorted by amount or usage count
  const pieChartData = useMemo(() => {
    return Object.values(discountsByCode)
      .sort((a, b) => 
        pieMode === "amount" 
          ? b.total_discount_amount - a.total_discount_amount 
          : b.usage_count - a.usage_count
      )
      .slice(0, 5); // Top 5 discounts
  }, [discountsByCode, pieMode]);

  // Calculate total value for pie chart center
  const totalValue = useMemo(() => {
    return pieChartData.reduce(
      (acc, curr) => acc + (pieMode === "amount" ? curr.total_discount_amount : curr.usage_count),
      0
    );
  }, [pieChartData, pieMode]);

  // Build chart config for the pie chart
  const chartConfig = useMemo(() => {
    return pieChartData.reduce((acc, discount) => {
      acc[discount.discount_code] = {
        label: discount.discount_code,
        color: discount.color,
      };
      return acc;
    }, {} as ChartConfig);
  }, [pieChartData]);

  // Process data for time series chart
  const timeSeriesData = useMemo(() => {
    // Group by date
    const byDate = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          usage_count: 0,
          total_discount_amount: 0
        };
      }
      acc[date].usage_count += item.usage_count;
      acc[date].total_discount_amount += item.total_discount_amount;
      return acc;
    }, {} as Record<string, { date: string; usage_count: number; total_discount_amount: number }>);

    // Convert to array and format dates
    return Object.values(byDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  }, [data]);

  // Calculate trend if there's enough data
  const calculateTrend = () => {
    if (timeSeriesData.length < 2) return { percentage: 0, increasing: true };
    
    // Use the last 7 days for trend calculation if available, otherwise last 2
    const trendData = timeSeriesData.length > 7 ? timeSeriesData.slice(-7) : timeSeriesData.slice(-2);
    const startValue = pieMode === "amount" ? trendData[0].total_discount_amount : trendData[0].usage_count;
    const endValue = pieMode === "amount" ? trendData[trendData.length - 1].total_discount_amount : trendData[trendData.length - 1].usage_count;
    
    const difference = endValue - startValue;
    const percentage = startValue !== 0 
      ? (difference / startValue) * 100 
      : (endValue > 0 ? 100 : 0); // Handle division by zero
    
    return {
      percentage: Math.abs(percentage),
      increasing: difference >= 0
    };
  };

  const trend = calculateTrend();

  // Get the date range for display
  const getDateRange = () => {
    if (timeSeriesData.length === 0) return "No data available";
    if (timeSeriesData.length === 1) return timeSeriesData[0].date;
    
    const firstDate = timeSeriesData[0].date;
    const lastDate = timeSeriesData[timeSeriesData.length - 1].date;
    
    return `${firstDate} - ${lastDate}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Pie Chart Card */}
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
          <div>
            <CardTitle>Discount Usage by Code</CardTitle>
            <CardDescription>Top 5 discount codes</CardDescription>
          </div>

          {/* Toggle for switching between amount and usage count */}
          <ToggleGroup
            type="single"
            value={pieMode}
            onValueChange={(val) => val && setPieMode(val as "amount" | "usage")}
            className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
          >
            <ToggleGroupItem
              value="amount"
              aria-label="By Amount"
              className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow"
            >
              <DollarSign className="h-4 w-4"/>
              Amount
            </ToggleGroupItem>
            <ToggleGroupItem
              value="usage"
              aria-label="By Usage"
              className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow"
            >
              <Tag className="h-4 w-4"/>
              Usage
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px] pb-1"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel/>}
              />
              {/* Add legend to the bottom */}
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
                formatter={(value, entry) => (
                  <span className="text-xs text-foreground">
                    {value}
                  </span>
                )}
              />
              <Pie
                data={pieChartData}
                dataKey={pieMode === "amount" ? "total_discount_amount" : "usage_count"}
                nameKey="discount_code"
                innerRadius={70}
                strokeWidth={5}
              >
                {pieChartData.map((entry) => (
                  <Cell key={`cell-${entry.discount_code}`} fill={entry.color}/>
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
                            {pieMode === "amount"
                              ? formatCurrency(totalValue, "LKR", "en-LK").split(".")[0]
                              : totalValue.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {pieMode === "amount"
                              ? "Total Savings"
                              : "Total Uses"}
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

      {/* Line Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Usage Over Time</CardTitle>
          <CardDescription>{getDateRange()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            usage_count: {
              label: "Usage Count",
              color: chartColors[0], // Teal
            },
            total_discount_amount: {
              label: "Discount Amount",
              color: chartColors[1], // Sky Blue
            },
          }}
          className="h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={timeSeriesData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)} // Show abbreviated month
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${formatCurrency(value, 'LKR').slice(0, -3)}`} // Shorten currency
              />
              <ChartTooltip 
                cursor={false} 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      if (name === 'total_discount_amount') {
                        return formatCurrency(value as number, 'LKR', 'en-LK');
                      }
                      return value.toLocaleString();
                    }}
                  />
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="usage_count"
                stroke={chartColors[0]}
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total_discount_amount"
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              {timeSeriesData.length >= 2 && (
                <div className={`flex items-center gap-2 leading-none font-medium ${trend.increasing ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.increasing ? 'Trending up' : 'Trending down'} by {trend.percentage.toFixed(1)}% {' '}
                  <TrendingUp className={trend.increasing ? "h-4 w-4" : "h-4 w-4 transform rotate-180"} />
                </div>
              )}
              <div className="text-muted-foreground leading-none">
                Showing discount usage and amount over time
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};