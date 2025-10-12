'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionStatus } from "@/types/enums/sessionStatus";
import { SessionStatusCountDTO } from "@/lib/actions/statsActions";
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

interface SessionStatusChartProps {
  data: SessionStatusCountDTO[];
  isLoading: boolean;
}

export const SessionStatusChart = ({
  data,
  isLoading
}: SessionStatusChartProps) => {
  // Get status colors
  const getStatusColor = (status: SessionStatus) => {
    switch(status) {
      case SessionStatus.ON_SALE:
        return 'var(--color-success)';
      case SessionStatus.SCHEDULED:
        return 'var(--color-primary)';
      case SessionStatus.PENDING:
        return 'var(--color-warning)';
      case SessionStatus.SOLD_OUT:
        return 'var(--color-chart-1)';
      case SessionStatus.CLOSED:
        return 'var(--color-chart-2)';
      case SessionStatus.CANCELED:
        return 'var(--color-destructive)';
      default:
        return 'var(--color-muted)';
    }
  };

  // Format status labels for better display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Sessions by Status</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }} 
                tickFormatter={formatStatus}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} sessions`, 'Count']}
                labelFormatter={(label) => formatStatus(label)}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};