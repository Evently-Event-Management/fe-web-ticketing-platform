'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    tickets_sold: number;
  }[];
  isLoading: boolean;
}

export const RevenueChart = ({
  data,
  isLoading
}: RevenueChartProps) => {
  // Format the date to be more readable
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Revenue & Ticket Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={data} 
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fontSize: 12 }} 
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }} 
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue') {
                    return [formatCurrency(value as number), 'Revenue'];
                  }
                  return [value, 'Tickets Sold'];
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="tickets_sold" 
                stroke="var(--color-success)" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Tickets Sold"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};