'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const statCardVariants = cva(
  "rounded-lg border text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card",
        revenue: "bg-card border-primary/20",
        sessions: "bg-card border-accent/20",
        discount: "bg-card border-destructive/20",
        tickets: "bg-card border-success/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatsCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  footer?: ReactNode;
}

export const StatsCard = ({
  title,
  value,
  icon,
  description,
  isLoading = false,
  variant,
  trend,
  footer
}: StatsCardProps) => {
  return (
    <Card className={statCardVariants({ variant })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-1.5 ${
          variant === 'revenue' ? 'bg-primary/10 text-primary' :
          variant === 'sessions' ? 'bg-accent/10 text-accent-foreground' :
          variant === 'discount' ? 'bg-destructive/10 text-destructive' :
          variant === 'tickets' ? 'bg-success/10 text-success' :
          'bg-muted text-muted-foreground'
        }`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        {isLoading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <div className="text-2xl font-bold">
            {value}
            {trend && (
              <span className={`ml-2 text-sm font-normal ${
                trend.isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="border-t p-3 text-xs text-muted-foreground">
          {isLoading ? <Skeleton className="h-4 w-full" /> : footer}
        </CardFooter>
      )}
    </Card>
  );
};