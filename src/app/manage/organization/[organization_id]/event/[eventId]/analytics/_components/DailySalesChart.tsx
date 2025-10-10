"use client"

import React from 'react';
import { DailySalesMetrics } from '@/lib/actions/analyticsActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from "lucide-react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DailySalesChartProps {
  data: DailySalesMetrics[];
}

export const DailySalesChart: React.FC<DailySalesChartProps> = ({ data }) => {
  // Format the data for the chart
  const formattedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    tickets: item.tickets_sold
  }));

  // Calculate trend if there's enough data
  const calculateTrend = () => {
    if (data.length < 2) return { percentage: 0, increasing: true };
    
    // Use the last 7 days for trend calculation if available, otherwise last 2
    const trendData = data.length > 7 ? data.slice(-7) : data.slice(-2);
    const startRevenue = trendData[0].revenue;
    const endRevenue = trendData[trendData.length - 1].revenue;
    
    const difference = endRevenue - startRevenue;
    const percentage = startRevenue !== 0 
      ? (difference / startRevenue) * 100 
      : (endRevenue > 0 ? 100 : 0); // Handle division by zero
    
    return {
      percentage: Math.abs(percentage),
      increasing: difference >= 0
    };
  };

  const trend = calculateTrend();
  
  // Get the date range for display
  const getDateRange = () => {
    if (data.length === 0) return "No data available";
    if (data.length === 1) return new Date(data[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const firstDate = new Date(data[0].date);
    const lastDate = new Date(data[data.length - 1].date);
    
    return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--color-chart-1)",
    },
    tickets: {
      label: "Tickets Sold",
      color: "var(--color-chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales & Revenue</CardTitle>
        <CardDescription>{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}  className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={formattedData}
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
              tickFormatter={(value) => `${formatCurrency(value, 'LKR').slice(0, -3)}`} // Shorten currency
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip 
              cursor={false} 
              content={
                <ChartTooltipContent 
                  labelFormatter={(label) => {
                    const datePoint = data.find(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === label);
                    return datePoint ? new Date(datePoint.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : label;
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
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
              dataKey="revenue"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="tickets"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {data.length >= 2 && (
              <div className={`flex items-center gap-2 leading-none font-medium ${trend.increasing ? 'text-green-600' : 'text-red-600'}`}>
                {trend.increasing ? 'Trending up' : 'Trending down'} by {trend.percentage.toFixed(1)}% {' '}
                <TrendingUp className={trend.increasing ? "h-4 w-4" : "h-4 w-4 transform rotate-180"} />
              </div>
            )}
            <div className="text-muted-foreground leading-none">
              Showing daily sales and revenue over the event&#39;s sales period
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
