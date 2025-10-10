"use client"

import React from 'react';
import { AnalyticsCard } from '@/app/manage/organization/[organization_id]/event/[eventId]/analytics/_components/AnalyticsCard';
import { formatCurrency } from '@/lib/utils';
import { PiggyBank, Ticket, Tag } from 'lucide-react';
import { EventDiscountAnalytics } from '@/lib/actions/analyticsActions';

interface DiscountAnalyticsCardsProps {
  data: EventDiscountAnalytics;
  isLoading?: boolean;
}

export const DiscountAnalyticsCards: React.FC<DiscountAnalyticsCardsProps> = ({ data, isLoading = false }) => {
  // Calculate total savings across all discounts
  const totalSavings = data.discount_usage.reduce((sum, item) => sum + item.total_discount_amount, 0);
  
  // Calculate total number of usages
  const totalUsages = data.discount_usage.reduce((sum, item) => sum + item.usage_count, 0);
  
  // Calculate average discount per usage
  const avgSavingPerUse = totalUsages > 0 ? totalSavings / totalUsages : 0;
  
  // Count unique discount codes
  const uniqueDiscountCodes = new Set(data.discount_usage.map(item => item.discount_code)).size;
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <AnalyticsCard
        title="Total Discount Savings"
        value={formatCurrency(totalSavings, 'LKR', 'en-LK')}
        subtitle={`${formatCurrency(avgSavingPerUse, 'LKR', 'en-LK')} avg. per use`}
        icon={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PiggyBank className="h-4 w-4"/>
          </div>
        }
        isLoading={isLoading}
      />
      
      <AnalyticsCard
        title="Discount Usages"
        value={totalUsages.toLocaleString()}
        subtitle={`Across ${uniqueDiscountCodes} unique discount code${uniqueDiscountCodes !== 1 ? 's' : ''}`}
        icon={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Ticket className="h-4 w-4"/>
          </div>
        }
        isLoading={isLoading}
      />
      
      <AnalyticsCard
        title="Most Used Discount"
        value={getMostUsedDiscount(data.discount_usage).code}
        subtitle={`${getMostUsedDiscount(data.discount_usage).count.toLocaleString()} uses, ${formatCurrency(getMostUsedDiscount(data.discount_usage).savings, 'LKR', 'en-LK')} saved`}
        icon={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Tag className="h-4 w-4"/>
          </div>
        }
        isLoading={isLoading}
      />
    </div>
  );
};

// Helper function to find the most used discount code
function getMostUsedDiscount(discounts: {discount_code: string; usage_count: number; total_discount_amount: number}[]) {
  if (!discounts.length) return { code: 'None', count: 0, savings: 0 };
  
  let mostUsed = discounts[0];
  
  for (const discount of discounts) {
    if (discount.usage_count > mostUsed.usage_count) {
      mostUsed = discount;
    }
  }
  
  return {
    code: mostUsed.discount_code,
    count: mostUsed.usage_count,
    savings: mostUsed.total_discount_amount
  };
}