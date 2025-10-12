'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip
} from "recharts";

interface DiscountData {
  discount_code: string;
  usage_count: number;
  total_discount_amount: number;
}

interface DiscountUsageChartProps {
  data: DiscountData[];
  isLoading: boolean;
}

// Custom colors for pie chart
const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-primary)',
  'var(--color-secondary)',
];

export const DiscountUsageChart = ({
  data,
  isLoading
}: DiscountUsageChartProps) => {
  // Process data for the pie chart
  const chartData = data
    .sort((a, b) => b.total_discount_amount - a.total_discount_amount)
    .slice(0, 5) // Take top 5 discounts
    .map(item => ({
      name: item.discount_code,
      value: item.total_discount_amount,
      count: item.usage_count
    }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Discounts</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)} 
                labelFormatter={(label) => `Discount: ${label}`} 
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No discount data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};